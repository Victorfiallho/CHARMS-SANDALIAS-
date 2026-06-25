export type Contact = {
  id: string;
  nome: string;
  telefone: string | null;
  instagram_id: string | null;
  origem: string;
  status: string;
  tags: string[];
  created_at?: string;
  last_seen_at: string | null;
  stageColor?: string;
};
