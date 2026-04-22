import Anthropic from "@anthropic-ai/sdk";
import { Value } from "@sinclair/typebox/value";
import { AiProposalContentSchema, AiProposalContent } from "@/modules/proposals/schemas/block.schema.js";
import {
  AiGenerationError,
  AiUnavailableError,
} from "@/modules/proposals/constants/errors.js";
import { PROPOSAL_SYSTEM_PROMPT } from "./system-prompt.js";
import {
  GenerateProposalInput,
  GenerateProposalOutput,
  IAnthropicService,
} from "./anthropic.service.interface.js";

export type AnthropicServiceConfig = {
  apiKey: string;
  model: string;
  maxTokens: number;
  timeoutMs: number;
};

const TOOL_NAME = "emit_proposal";

export class AnthropicService implements IAnthropicService {
  private readonly client: Anthropic;

  constructor(private readonly config: AnthropicServiceConfig) {
    this.client = new Anthropic({ apiKey: config.apiKey });
  }

  async generateProposal(input: GenerateProposalInput): Promise<GenerateProposalOutput> {
    const toolInputSchema = toolSchemaFromTypeBox(AiProposalContentSchema);

    const initialMessages: Anthropic.MessageParam[] = [
      { role: "user", content: input.prompt },
    ];

    const first = await this.callClaude(initialMessages, toolInputSchema, input.signal);
    const firstValidated = tryValidate(first.toolInput);
    if (firstValidated.ok) {
      return { content: firstValidated.value, model: first.model };
    }

    // Retry once, feeding the validation error back.
    const retryMessages: Anthropic.MessageParam[] = [
      ...initialMessages,
      { role: "assistant", content: first.rawAssistantContent },
      {
        role: "user",
        content: `Your previous tool call failed schema validation: ${firstValidated.error}. Call the ${TOOL_NAME} tool again with a valid payload.`,
      },
    ];

    const second = await this.callClaude(retryMessages, toolInputSchema, input.signal);
    const secondValidated = tryValidate(second.toolInput);
    if (secondValidated.ok) {
      return { content: secondValidated.value, model: second.model };
    }

    throw new AiGenerationError();
  }

  private async callClaude(
    messages: Anthropic.MessageParam[],
    toolInputSchema: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<{ toolInput: unknown; rawAssistantContent: Anthropic.ContentBlock[]; model: string }> {
    let response: Anthropic.Message;
    try {
      response = await this.client.messages.create(
        {
          model: this.config.model,
          max_tokens: this.config.maxTokens,
          system: PROPOSAL_SYSTEM_PROMPT,
          tools: [
            {
              name: TOOL_NAME,
              description: "Emit the final structured proposal document.",
              input_schema: toolInputSchema as Anthropic.Tool.InputSchema,
            },
          ],
          tool_choice: { type: "tool", name: TOOL_NAME },
          messages,
        },
        { signal, timeout: this.config.timeoutMs },
      );
    } catch (err) {
      if (err instanceof Anthropic.APIError) {
        throw new AiUnavailableError(err.message);
      }
      if (err instanceof Error && err.name === "AbortError") {
        throw new AiUnavailableError("Generation aborted.");
      }
      throw new AiUnavailableError();
    }

    const toolUse = response.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === TOOL_NAME,
    );
    if (!toolUse) {
      throw new AiGenerationError("Model did not call the emit_proposal tool.");
    }

    return { toolInput: toolUse.input, rawAssistantContent: response.content, model: response.model };
  }
}

function tryValidate(input: unknown): { ok: true; value: AiProposalContent } | { ok: false; error: string } {
  if (!Value.Check(AiProposalContentSchema, input)) {
    const errors = [...Value.Errors(AiProposalContentSchema, input)];
    const first = errors[0];
    return {
      ok: false,
      error: first ? `${first.path || "(root)"}: ${first.message}` : "Unknown validation error.",
    };
  }
  return { ok: true, value: input };
}

// TypeBox schemas are structurally valid JSON Schema; strip any TypeBox-only keys.
function toolSchemaFromTypeBox(schema: unknown): Record<string, unknown> {
  return JSON.parse(JSON.stringify(schema, (key, value) => (key.startsWith("[") ? undefined : value)));
}
