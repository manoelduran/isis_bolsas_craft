import type { MaterialDetails } from "@/types";
import { FormFieldGamified } from "./FormFieldGamified";

interface Props {
  category: "primary" | "secondary" | "extra";
  items: Record<string, MaterialDetails>;
}

export function FormSection({ category, items }: Props) {

  if (Object.keys(items).length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        Nenhum item encontrado para esta busca.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Object.entries(items).map(([itemId, itemData]) => (
        <FormFieldGamified 
          key={itemId} 
          category={category}
          itemId={itemId}
          itemData={itemData} 
        />
      ))}
    </div>
  );
}