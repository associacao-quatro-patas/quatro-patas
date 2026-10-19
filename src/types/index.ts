// Tipos de domínio. Os pets refletem a tabela real do Supabase
// (supabase/migrations/001 e 003); os demais ainda são PRELIMINARES e serão
// ajustados quando suas tabelas forem criadas.

export type { Pet, PetSpecies, PetSex, PetSize, PetStatus } from "./database";

export type Instituicao = {
  nome: string;
  sobre: string | null;
  whatsapp: string | null;
  email: string | null;
  instagram: string | null;
  endereco: string | null;
};

export type InformacoesDoacao = {
  chavePix: string | null;
  nomeRecebedor: string | null;
  cidadeRecebedor: string | null;
  observacoes: string | null;
};

export type Insumo = {
  id: string;
  nome: string;
  descricao: string | null;
  urgente: boolean;
  ativo: boolean;
  ordem: number;
};
