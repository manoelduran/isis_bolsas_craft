
import type { BagForm, MaterialsState } from "@/types";
import { sanitizeForFilename } from "./utils";

export const generateCraftCsv = (formData: BagForm, materialsState: MaterialsState) => {

  let totalCost = 0;
  const usedMaterials: { id: string, name: string, cost: number, unit: string, quantity: number }[] = [];

  const categories: Array<keyof Omit<BagForm, 'style' | 'dimensions' | 'profit_percentage' | 'taxes' | 'created_at' | 'bag_quantity'>> = ['primary', 'secondary', 'extra'];

  categories.forEach(categoryKey => {
    const categoryItems = formData[categoryKey];
    if (categoryItems) {
      Object.entries(categoryItems).forEach(([itemId, itemData]) => {
        const quantityAsNumber = parseFloat(String(itemData.quantity)) || 0;

        if (quantityAsNumber > 0) {
          const staticItemData = materialsState[categoryKey][itemId];
          let costForCsv: number;

          if (categoryKey === 'extra') {
            costForCsv = parseFloat(String((itemData && 'cost' in itemData ? (itemData as any).cost : 0))) || 0;
          } else {
            costForCsv = staticItemData.cost;
          }

          const subtotal = costForCsv * quantityAsNumber;
          totalCost += subtotal;

          usedMaterials.push({
            id: itemId,
            name: staticItemData.name,
            cost: costForCsv,
            unit: staticItemData.unit,
            quantity: quantityAsNumber,
          });
        }
      });
    }
  });

  // Cálculos financeiros completos
  const bagQuantity = parseInt(String(formData.bag_quantity)) || 1;
  const profitAsNumber = parseFloat(String(formData.profit_percentage)) || 0;
  const taxesAsNumber = parseFloat(String(formData.taxes)) || 0;
  const profitAmount = totalCost * (profitAsNumber / 100);
  const costWithProfit = totalCost + profitAmount;
  const finalPriceWithTaxes = (costWithProfit * (taxesAsNumber / 100)) + costWithProfit;

  const rows: (string | number)[][] = [];

  rows.push(['style', `"${formData.style}"`]);
  rows.push(['dimensions', `"${formData.dimensions}"`]);
  rows.push(['created_at', `"${formData.created_at}"`]);
  rows.push([]);

  rows.push(['--- Materiais Utilizados ---']);
  rows.push(['id', 'name', 'cost', 'quantity', 'unit']);
  usedMaterials.forEach(material => {
    rows.push([
      material.id,
      `"${material.name}"`,
      material.cost.toFixed(2),
      material.quantity,
      material.unit
    ]);
  });
  rows.push([]);

  rows.push(['--- Resumo Financeiro ---']);
  rows.push(['bag_quantity', bagQuantity]);
  rows.push(['custo_total', (totalCost).toFixed(2)]);
  rows.push(['profit_percentage', formData.profit_percentage]);
  rows.push(['taxes', formData.taxes]);
  rows.push(['lucro_calculado', profitAmount.toFixed(2)]);
  rows.push(['preco_venda_sem_imposto', costWithProfit.toFixed(2)]);
  rows.push(['preco_final_com_imposto', finalPriceWithTaxes.toFixed(2)]);

  const csvContent = rows.map(e => e.join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const sanitizedStyle = sanitizeForFilename(formData.style || 'bolsa_sem_nome');
  const sanitizedDimensions = (formData.dimensions || 'sem_dimensoes').replace(/\s*x\s*/g, '_').replace(/[^a-z0-9_]/g, '');
  const filename = `${sanitizedStyle}_${sanitizedDimensions}.csv`;

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};