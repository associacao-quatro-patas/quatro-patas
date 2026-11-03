"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { checkAdmin } from "@/lib/auth";
import {
  parseAdoptedPetForm,
  parseAdoptionForm,
  type AdoptedPetErrors,
  type AdoptionFormErrors,
} from "@/lib/adoptions/validation";
import { insertPetWithSlug, registerAdoption, removePetPhoto } from "@/lib/pets/admin";
import { PETS_CACHE_TAG, PHOTO_PATH_REGEX } from "@/lib/pets/constants";

export type AdoptedFormState = {
  message?: string;
  errors?: AdoptedPetErrors & AdoptionFormErrors;
};

/**
 * Cadastra (petId = null) ou edita um animal adotado com os dados do tutor.
 * Reutiliza a tabela pets (status "adopted"); os dados do tutor vão para
 * pet_adoptions, que só administradores acessam. A foto já foi enviada pelo
 * navegador ao bucket "pets"; aqui chega só o nome do arquivo.
 */
export async function saveAdoptedPet(
  petId: string | null,
  _prev: AdoptedFormState,
  formData: FormData,
): Promise<AdoptedFormState> {
  const auth = await checkAdmin();
  const pet = parseAdoptedPetForm(formData);
  const adoption = parseAdoptionForm(formData);

  if (!auth.ok) return { message: auth.message };
  if (!pet.ok || !adoption.ok) {
    const uploaded = formData.get("photo_path");
    if (typeof uploaded === "string" && PHOTO_PATH_REGEX.test(uploaded)) {
      await removePetPhoto(auth.supabase, uploaded);
    }
    return {
      message: "Confira os campos destacados.",
      errors: { ...(pet.ok ? {} : pet.errors), ...(adoption.ok ? {} : adoption.errors) },
    };
  }

  const { supabase } = auth;
  const { photoPath } = pet;

  if (petId === null) {
    // Animal adotado antes de existir o site: cadastrado direto como adotado.
    const created = await insertPetWithSlug(supabase, {
      ...pet.data,
      age: null,
      description: null,
      story: null,
      status: "adopted",
      ...(photoPath ? { photo_path: photoPath } : {}),
    });
    if (!created.ok) {
      await removePetPhoto(supabase, photoPath);
      return { message: created.message };
    }

    const adoptionError = await registerAdoption(supabase, created.id, adoption.data);
    if (adoptionError) {
      // Não deixa um adotado sem tutor: desfaz o cadastro.
      await supabase.from("pets").delete().eq("id", created.id);
      await removePetPhoto(supabase, photoPath);
      return { message: adoptionError };
    }
  } else {
    const { data: current, error: findError } = await supabase
      .from("pets")
      .select("photo_path, status")
      .eq("id", petId)
      .maybeSingle();

    if (findError || !current || current.status !== "adopted") {
      await removePetPhoto(supabase, photoPath);
      return { message: "Animal adotado não encontrado. Ele pode ter sido excluído." };
    }

    // Só os campos deste formulário; descrição, história etc. são mantidos.
    const { error } = await supabase
      .from("pets")
      .update({ ...pet.data, ...(photoPath ? { photo_path: photoPath } : {}) })
      .eq("id", petId);

    if (error) {
      await removePetPhoto(supabase, photoPath);
      return { message: `Não foi possível salvar: ${error.message}` };
    }

    if (photoPath && current.photo_path && current.photo_path !== photoPath) {
      await removePetPhoto(supabase, current.photo_path);
    }

    const adoptionError = await registerAdoption(supabase, petId, adoption.data);
    if (adoptionError) {
      updateTag(PETS_CACHE_TAG);
      return { message: `Os dados do animal foram salvos, mas os dados da adoção não. ${adoptionError}` };
    }
  }

  updateTag(PETS_CACHE_TAG);
  redirect("/admin/adotados");
}
