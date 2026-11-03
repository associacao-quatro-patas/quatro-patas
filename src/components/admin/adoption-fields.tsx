import type { PetAdoption } from "@/types/database";
import { ADOPTION_LIMITS, MIN_ADOPTION_DATE, type AdoptionFormErrors } from "@/lib/adoptions/validation";
import { Field, inputClass } from "./form-ui";

/**
 * Dados do tutor e data da adoção (usados nas abas Pets e Adotados).
 * São dados pessoais: ficam só no painel e nunca aparecem no site.
 */
export function AdoptionFields({
  adoption,
  errors = {},
  maxDate,
}: {
  adoption?: PetAdoption | null;
  errors?: AdoptionFormErrors;
  maxDate: string;
}) {
  return (
    <fieldset className="grid gap-4 rounded-xl border border-border bg-rosa-pastel/50 p-4 sm:grid-cols-2">
      <legend className="px-1 font-bold text-rosa-escuro">Dados da adoção</legend>
      <p className="-mt-1 text-sm text-muted sm:col-span-2">
        Visíveis apenas para administradores. No site aparecem somente a foto e o nome do animal.
      </p>
      <div className="sm:col-span-2">
        <Field label="Nome completo do tutor *" error={errors.tutor_name}>
          <input
            name="tutor_name"
            defaultValue={adoption?.tutor_name}
            required
            maxLength={ADOPTION_LIMITS.tutorName}
            autoComplete="off"
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Contato do tutor *" error={errors.tutor_contact} hint="Telefone, WhatsApp ou e-mail.">
        <input
          name="tutor_contact"
          defaultValue={adoption?.tutor_contact}
          required
          maxLength={ADOPTION_LIMITS.tutorContact}
          autoComplete="off"
          className={inputClass}
        />
      </Field>
      <Field label="Data da adoção *" error={errors.adopted_at}>
        <input
          type="date"
          name="adopted_at"
          defaultValue={adoption?.adopted_at ?? maxDate}
          min={MIN_ADOPTION_DATE}
          max={maxDate}
          required
          className={inputClass}
        />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Endereço do tutor" error={errors.tutor_address}>
          <textarea
            name="tutor_address"
            defaultValue={adoption?.tutor_address ?? ""}
            maxLength={ADOPTION_LIMITS.tutorAddress}
            rows={2}
            autoComplete="off"
            className={inputClass}
          />
        </Field>
      </div>
    </fieldset>
  );
}
