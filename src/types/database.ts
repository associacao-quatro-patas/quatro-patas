// Tipos do banco Supabase escritos à mão a partir das migrações em
// supabase/migrations. Se o schema mudar, atualize aqui (ou gere com
// `npx supabase gen types typescript`).

export type PetSpecies = "dog" | "cat" | "other";
export type PetSex = "male" | "female" | "unknown";
export type PetSize = "small" | "medium" | "large";
export type PetStatus = "available" | "adoption_in_progress" | "adopted";

export type Pet = {
  id: string;
  name: string;
  slug: string;
  species: PetSpecies;
  sex: PetSex;
  age: string | null;
  size: PetSize;
  description: string | null;
  story: string | null;
  is_neutered: boolean;
  is_vaccinated: boolean;
  status: PetStatus;
  photo_path: string | null;
  created_at: string;
  updated_at: string;
};

// Doações e insumos (migração 004).
export type PixKeyType = "cpf" | "cnpj" | "email" | "phone" | "random";

export type DonationSettings = {
  id: boolean;
  pix_key: string | null;
  pix_key_type: PixKeyType | null;
  recipient_name: string | null;
  pix_merchant_name: string | null;
  pix_merchant_city: string | null;
  pix_copy_paste: string | null;
  notes: string | null;
  updated_at: string;
};

export type Supply = {
  id: string;
  name: string;
  description: string | null;
  quantity: string | null;
  is_urgent: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

// Conteúdo institucional da página "Sobre" (migração 005).
export type NamedItem = { name: string; text: string };

export type InstitutionContent = {
  id: boolean;
  intro_text: string | null;
  history_text: string | null;
  mission_text: string | null;
  vision_text: string | null;
  values_items: NamedItem[] | null;
  work_intro: string | null;
  work_items: NamedItem[] | null;
  contact_email: string | null;
  instagram_url: string | null;
  phone: string | null;
  address: string | null;
  updated_at: string;
};

// Fotos dos espaços fixos do site (migração 006).
export type SitePhotoSlot =
  | "home_hero_adocao"
  | "home_hero_doacao"
  | "home_hero_sobre"
  | "home_quem_somos"
  | "doacoes_hero"
  | "doacoes_impacto";

export type SitePhoto = {
  slot: SitePhotoSlot;
  photo_path: string;
  alt_text: string | null;
  updated_at: string;
};

type SupplyInsert = Pick<Supply, "name"> &
  Partial<Pick<Supply, "description" | "quantity" | "is_urgent" | "is_active" | "sort_order">>;

type PetDefaults ="id" | "is_neutered" | "is_vaccinated" | "status" | "photo_path";

type PetInsert = Omit<Pet, PetDefaults | "created_at" | "updated_at"> & Partial<Pick<Pet, PetDefaults>>;

export type Database = {
  public: {
    Tables: {
      pets: {
        Row: Pet;
        Insert: PetInsert;
        Update: Partial<PetInsert>;
        Relationships: [];
      };
      donation_settings: {
        Row: DonationSettings;
        Insert: Partial<Omit<DonationSettings, "updated_at">>;
        Update: Partial<Omit<DonationSettings, "id" | "updated_at">>;
        Relationships: [];
      };
      supplies: {
        Row: Supply;
        Insert: SupplyInsert;
        Update: Partial<SupplyInsert>;
        Relationships: [];
      };
      institution_content: {
        Row: InstitutionContent;
        Insert: Partial<Omit<InstitutionContent, "updated_at">>;
        Update: Partial<Omit<InstitutionContent, "id" | "updated_at">>;
        Relationships: [];
      };
      site_photos: {
        Row: SitePhoto;
        Insert: Omit<SitePhoto, "updated_at">;
        Update: Partial<Omit<SitePhoto, "slot" | "updated_at">>;
        Relationships: [];
      };
      admins: {
        Row: { user_id: string; created_at: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      institution_items_valid: {
        Args: { items: unknown; max_items: number; max_name: number; max_text: number };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
