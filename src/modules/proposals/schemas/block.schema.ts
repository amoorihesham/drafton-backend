import { Type, Static } from "@sinclair/typebox";

const HeadingBlock = Type.Object({
  type: Type.Literal("heading"),
  level: Type.Union([Type.Literal(1), Type.Literal(2), Type.Literal(3)]),
  text: Type.String(),
});

const ParagraphBlock = Type.Object({
  type: Type.Literal("paragraph"),
  text: Type.String(),
});

const ListBlock = Type.Object({
  type: Type.Literal("list"),
  style: Type.Union([Type.Literal("bullet"), Type.Literal("number")]),
  items: Type.Array(Type.String()),
});

const ImageBlock = Type.Object({
  type: Type.Literal("image"),
  url: Type.String(),
  caption: Type.Optional(Type.String()),
});

const TableBlock = Type.Object({
  type: Type.Literal("table"),
  headers: Type.Array(Type.String()),
  rows: Type.Array(Type.Array(Type.String())),
});

const PricingItem = Type.Object({
  name: Type.String(),
  qty: Type.Number({ minimum: 0 }),
  unitPrice: Type.Number({ minimum: 0 }),
});

const PricingBlock = Type.Object({
  type: Type.Literal("pricing"),
  currency: Type.String(),
  items: Type.Array(PricingItem),
});

const DividerBlock = Type.Object({
  type: Type.Literal("divider"),
});

const QuoteBlock = Type.Object({
  type: Type.Literal("quote"),
  text: Type.String(),
  cite: Type.Optional(Type.String()),
});

const SignatureBlock = Type.Object({
  type: Type.Literal("signature"),
  label: Type.String(),
  signerRole: Type.Union([Type.Literal("client"), Type.Literal("provider")]),
});

const DateFieldBlock = Type.Object({
  type: Type.Literal("dateField"),
  label: Type.String(),
});

export const BlockSchema = Type.Union([
  HeadingBlock,
  ParagraphBlock,
  ListBlock,
  ImageBlock,
  TableBlock,
  PricingBlock,
  DividerBlock,
  QuoteBlock,
  SignatureBlock,
  DateFieldBlock,
]);

export const SectionSchema = Type.Object({
  id: Type.String(),
  title: Type.Optional(Type.String()),
  blocks: Type.Array(BlockSchema),
});

export const ProposalContentSchema = Type.Object({
  sections: Type.Array(SectionSchema),
});

// AI tool input_schema variant — omits server-stamped section ids.
export const AiSectionSchema = Type.Object({
  title: Type.Optional(Type.String()),
  blocks: Type.Array(BlockSchema),
});

export const AiProposalContentSchema = Type.Object({
  title: Type.String(),
  sections: Type.Array(AiSectionSchema),
});

export type Block = Static<typeof BlockSchema>;
export type Section = Static<typeof SectionSchema>;
export type ProposalContent = Static<typeof ProposalContentSchema>;
export type AiProposalContent = Static<typeof AiProposalContentSchema>;
