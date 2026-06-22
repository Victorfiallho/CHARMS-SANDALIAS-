export type ContactStatus =
  | "novo"
  | "qualificado"
  | "negociacao"
  | "fechamento"
  | "pos-venda";

export interface Contact {
  id: string;
  nome: string;
  telefone?: string;
  instagramId?: string;
  email?: string;
  origem: string;
  status: ContactStatus;
  tags: string[];
  createdAt: string;
}

export interface Message {
  id: string;
  contactId: string;
  canal: "whatsapp" | "instagram" | "email";
  direction: "inbound" | "outbound";
  conteudo: string;
  timestamp: string;
  externalId: string;
}
