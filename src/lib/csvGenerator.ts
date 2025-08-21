import type { RawMaterial } from "@/types";
import { formatCurrency } from "./utils";

interface CraftData {
  [key: string]: number;
}

export const generateCraftCsv = (craftData: CraftData, materials: RawMaterial[]) => {
  const headers = ['Materia_Prima', 'Custo_Unitario', 'Quantidade', 'Subtotal'];
  
  const materialMap = new Map(materials.map(m => [m.id, m]));

  const rows = Object.entries(craftData)
    .filter(([, quantity]) => quantity > 0)
    .map(([id, quantity]) => {
      const material = materialMap.get(id);
      if (!material) return null;
      
      const subtotal = material.cost * quantity;
      return [
        material.name,
        formatCurrency(material.cost),
        quantity,
        formatCurrency(subtotal)
      ];
    }).filter(Boolean) as string[][];

  const totalCost = rows.reduce((acc, row) => {
    // Extrai o valor numérico da string de moeda
    const value = parseFloat(row[3].replace('R$', '').replace('.', '').replace(',', '.').trim());
    return acc + value;
  }, 0);
  
  rows.push(['', '', 'CUSTO TOTAL', formatCurrency(totalCost)]);

  let csvContent = "data:text/csv;charset=utf-8," 
    + [headers, ...rows].map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
  link.setAttribute("download", `craft_isis_bolsas_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};