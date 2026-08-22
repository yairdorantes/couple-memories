import { Plus } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";

export function FloatingActionButton() {
  const { t } = useI18n();

  return (
    <button
      className='floating-action-button'
      type='button'
      aria-label={t("actions.addMemory")}
    >
      <Plus className='h-7 w-7' aria-hidden='true' />
    </button>
  );
}
