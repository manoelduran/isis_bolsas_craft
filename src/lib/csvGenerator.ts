import type { CraftingFormState } from "@/types";
import { formatCurrency } from "./utils";

type FormData = {
  style: string;
  primary: Record<string, { quantity: number }>;
  secondary: Record<string, { quantity: number }>;
  extra: Record<string, { quantity: number }>;
}

export const generateCraftCsv = (formData: FormData, craftState: CraftingFormState) => {
  const headers = ['Categoria', 'Materia_Prima', 'Custo_Unitario', 'Unidade', 'Quantidade', 'Subtotal'];
  let rows: string[][] = [];

  rows.push(['Modelo da Bolsa', formData.style, '', '', '', '']);
  rows.push([]);

  let totalCost = 0;

  for (const categoryKey in formData) {
    if (categoryKey === 'style') continue;

    const categoryName = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
    const items = formData[categoryKey as keyof Omit<FormData, 'style'>];

    for (const itemId in items) {
      const { quantity } = items[itemId];
      if (quantity > 0) {
        const itemData = craftState[categoryKey as keyof CraftingFormState][itemId];
        const subtotal = itemData.cost * quantity;
        totalCost += subtotal;

        rows.push([
          categoryName,
          itemData.name,
          formatCurrency(itemData.cost),
          itemData.unity,
          String(quantity),
          formatCurrency(subtotal)
        ]);
      }
    }
  }

  rows.push([]);
  rows.push(['', '', '', '', 'CUSTO TOTAL', formatCurrency(totalCost)]);

  let csvContent = "data:text/csv;charset=utf-8," 
    + [headers, ...rows].map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `craft_${formData.style.replace(/\s+/g, '_')}_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};