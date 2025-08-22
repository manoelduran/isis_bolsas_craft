import type { CraftCategory } from "@/types";
import { FormFieldGamified } from "./FormFieldGamified";

interface Props {
  category: "primary" | "secondary" | "extra";
  items: CraftCategory;
}

export function FormSection({ category, items }: Props) {
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