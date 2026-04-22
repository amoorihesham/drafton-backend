export type BlockType = {
  type:
    | "heading"
    | "paragraph"
    | "list"
    | "image"
    | "table"
    | "pricing"
    | "divider"
    | "quote"
    | "signature"
    | "dateField";
  level?: 1 | 2 | 3;
  text?: string;
  items?: string[];
  url?: string;
  caption?: string;
  table?: { headers: string[]; rows: string[][] };
  qty?: number;
  unitPrice?: number;
  currency?: string;
  cite?: string;
  label?: string;
  signerRole?: "client" | "provider";
};

export type SectionType = {
  id: string;
  title: string;
  blocks: BlockType[];
};

export type ProposalContent = {
  sections: SectionType[];
};
export type ProposalStatus = "draft" | "generating" | "ready" | "signed" | "archived" | "failed";

export type ProposalFullType = {
  internal_id: number;
  id: string;
  created_by: number;
  created_for: string;
  title: string;
  description: string;
  status: ProposalStatus;
  prompt: string;
  content: SectionType;
  model: string;
  created_at: Date;
  updated_at: Date;
};

export type CreateProposalType = Pick<ProposalFullType, "created_for" | "description" | "title" | "prompt">;
