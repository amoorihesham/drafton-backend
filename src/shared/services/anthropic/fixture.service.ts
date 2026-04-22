import { AiProposalContent } from "@/modules/proposals/schemas/block.schema.js";
import {
  GenerateProposalInput,
  GenerateProposalOutput,
  IAnthropicService,
} from "./anthropic.service.interface.js";

const FIXTURE_MODEL = "fixture-proposal-v1";
const SIMULATED_LATENCY_MS = 600;

export class FixtureAnthropicService implements IAnthropicService {
  async generateProposal(input: GenerateProposalInput): Promise<GenerateProposalOutput> {
    await wait(SIMULATED_LATENCY_MS, input.signal);
    return { content: buildFixtureProposal(input.prompt), model: FIXTURE_MODEL };
  }
}

function buildFixtureProposal(prompt: string): AiProposalContent {
  const summary = prompt.length > 180 ? `${prompt.slice(0, 177).trim()}...` : prompt;
  const title = deriveTitle(prompt);

  return {
    title,
    sections: [
      {
        title: "Overview",
        blocks: [
          { type: "heading", level: 1, text: title },
          {
            type: "paragraph",
            text: `**Prepared for:** [client name]\n\n**Prepared by:** [your name]\n\nThis proposal outlines our approach, deliverables, timeline, and pricing for the engagement described below.`,
          },
          {
            type: "quote",
            text: `"${summary}"`,
            cite: "Project brief",
          },
        ],
      },
      {
        title: "Scope of Work",
        blocks: [
          { type: "heading", level: 2, text: "Scope of Work" },
          {
            type: "paragraph",
            text: "We will deliver a complete, production-ready solution that addresses the goals outlined in the brief. The engagement is broken into the following work streams:",
          },
          {
            type: "list",
            style: "bullet",
            items: [
              "**Discovery & planning** — stakeholder interviews, success metrics, technical audit.",
              "**Design** — wireframes, high-fidelity mockups, interactive prototype.",
              "**Implementation** — development against the agreed specification with weekly demos.",
              "**Launch & handoff** — QA, production deployment, documentation, training session.",
            ],
          },
        ],
      },
      {
        title: "Timeline",
        blocks: [
          { type: "heading", level: 2, text: "Timeline" },
          {
            type: "paragraph",
            text: "The projected schedule below assumes a kickoff date of **[project start date]**. Milestones are flexible and will be confirmed after discovery.",
          },
          {
            type: "table",
            headers: ["Milestone", "Target week", "Deliverable"],
            rows: [
              ["Kickoff", "Week 1", "Discovery recap + roadmap"],
              ["Design sign-off", "Week 3", "Approved mockups"],
              ["Implementation complete", "Week 8", "Feature-complete staging build"],
              ["Launch", "Week 10", "Production release"],
            ],
          },
        ],
      },
      {
        title: "Pricing",
        blocks: [
          { type: "heading", level: 2, text: "Pricing" },
          {
            type: "paragraph",
            text: "All amounts are in USD. 50% is due on kickoff, 50% on launch. Change requests outside the agreed scope are billed at a blended hourly rate of $150/hr.",
          },
          {
            type: "pricing",
            currency: "USD",
            items: [
              { name: "Discovery & planning", qty: 1, unitPrice: 2500 },
              { name: "Design", qty: 1, unitPrice: 4500 },
              { name: "Implementation", qty: 1, unitPrice: 9500 },
              { name: "Launch & handoff", qty: 1, unitPrice: 1500 },
            ],
          },
        ],
      },
      {
        title: "Terms",
        blocks: [
          { type: "heading", level: 2, text: "Terms" },
          {
            type: "list",
            style: "number",
            items: [
              "This proposal is valid for 30 days from the date below.",
              "Either party may terminate with 14 days' written notice; work completed to date is billable.",
              "All deliverables become the client's property upon final payment.",
              "Confidential information shared during the engagement is covered by a mutual NDA.",
            ],
          },
        ],
      },
      {
        title: "Sign-off",
        blocks: [
          { type: "heading", level: 2, text: "Sign-off" },
          {
            type: "paragraph",
            text: "By signing below, both parties agree to the scope, timeline, and terms outlined above.",
          },
          { type: "signature", label: "Client signature", signerRole: "client" },
          { type: "signature", label: "Provider signature", signerRole: "provider" },
          { type: "dateField", label: "Date" },
        ],
      },
    ],
  };
}

function deriveTitle(prompt: string): string {
  const firstSentence = prompt.split(/[.!?\n]/)[0]?.trim() ?? "";
  if (firstSentence.length > 0 && firstSentence.length <= 80) {
    return `Proposal — ${firstSentence}`;
  }
  const firstWords = prompt.trim().split(/\s+/).slice(0, 8).join(" ");
  return `Proposal — ${firstWords}${prompt.trim().split(/\s+/).length > 8 ? "..." : ""}`;
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("Aborted"));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new Error("Aborted"));
    });
  });
}
