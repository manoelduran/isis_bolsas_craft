import type { BagForm, MaterialsState } from "@/types";
import { sanitizeForFilename, formatMaterialName } from "./utils";

export const generateCraftCsv = (formData: BagForm, materialsState: MaterialsState) => {

  let baseCostPerBag = 0;
  let extraCost = 0;
  const usedMaterials: { id: string, name: string, category: string, cost: number, quantity: number | string }[] = [];

  const bagQuantity = parseInt(String(formData.bag_quantity)) || 1;

  ['primary', 'secondary'].forEach(categoryKey => {
    const categoryItems = formData[categoryKey as 'primary' | 'secondary'];
    if (categoryItems) {
      Object.entries(categoryItems).forEach(([itemId, itemData]) => {
        const perBagQuantity = parseFloat(String(itemData.quantity)) || 0;
        if (perBagQuantity > 0) {
          const staticItemData = materialsState[categoryKey as 'primary' | 'secondary'][itemId];
          const subtotalPerBag = staticItemData.cost as number * perBagQuantity;
          baseCostPerBag += subtotalPerBag;

          usedMaterials.push({
            id: itemId,
            name: staticItemData.name,
            category: staticItemData.category as string,
            cost: staticItemData.cost as number,
            quantity: perBagQuantity
          });
        }
      });
    }
  });

  const extraCategoryItems = formData.extra;
  if (extraCategoryItems) {
    Object.entries(extraCategoryItems).forEach(([itemId, itemData]) => {
      const costAsNumber = parseFloat(String(itemData.cost)) || 0;
      if (costAsNumber > 0) {
        const staticItemData = materialsState.extra[itemId];

        extraCost += costAsNumber;
        usedMaterials.push({
          id: itemId,
          name: staticItemData.name,
          category: staticItemData.category as string,
          cost: costAsNumber,
          quantity: ''
        });
      }
    });
  }

  const totalMaterialCost = baseCostPerBag * bagQuantity;
  const totalExtraCost = extraCost * bagQuantity;
  const grandTotalCost = totalMaterialCost + totalExtraCost;
  const profitAsNumber = parseFloat(String(formData.profit_percentage)) || 0;
  const taxesAsNumber = parseFloat(String(formData.taxes)) || 0;
  const profitAmount = grandTotalCost * (profitAsNumber / 100);
  const costWithProfit = grandTotalCost + profitAmount;
  const finalPriceWithTaxes = (costWithProfit * (taxesAsNumber / 100)) + costWithProfit;
  const rows: (string | number)[][] = [];

  rows.push(['style', `"${formData.style}"`]);
  rows.push(['dimensions', `"${formData.dimensions}"`]);
  rows.push(['created_at', `"${formData.created_at}"`]);
  rows.push(['bag_quantity', bagQuantity]);
  rows.push([]);

  rows.push(['--- Materiais Utilizados ---']);
  rows.push(['id', 'name','category', 'cost', 'quantity']);
  usedMaterials.forEach(material => {
    rows.push([
      material.id,
      `"${formatMaterialName(material.name)}"`,
      material.category,
      material.cost.toFixed(2),
      material.quantity
    ]);
  });
  rows.push([]);

  rows.push(['--- Resumo Financeiro ---']);
  rows.push(['custo_total_producao', grandTotalCost.toFixed(2)]);
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