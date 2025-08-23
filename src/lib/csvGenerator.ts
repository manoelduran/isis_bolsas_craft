import type { BagForm, MaterialsState } from "@/types";
  interface UsedMaterial {
    id: string;
    name: string;
    quantity: number;
    unity: string;
    subtotal: string;
  }

export const generateCraftCsv = (formData: BagForm, materialsState: MaterialsState) => {
  // --- 1. PROCESSAMENTO E CÁLCULO DOS DADOS ---

  // Primeiro, criamos uma lista de materiais utilizados e calculamos o custo total.
  let totalCost = 0;


  const usedMaterials: UsedMaterial[] = [];
  
  const categories: Array<keyof Omit<BagForm, 'style' | 'dimensions' | 'profit_percentage' | 'taxes'>> = ['primary', 'secondary', 'extra'];
  
  categories.forEach(categoryKey => {
    const categoryItems = formData[categoryKey];
    if (categoryItems) {
      Object.entries(categoryItems).forEach(([itemId, itemData]) => {
        if (itemData.quantity > 0) {
          const fullItemData = materialsState[categoryKey][itemId];
          const subtotal = fullItemData.cost * itemData.quantity;
          totalCost += subtotal;

          usedMaterials.push({
            id: itemId,
            name: fullItemData.name,
            quantity: itemData.quantity,
            unity: fullItemData.unity,
            subtotal: subtotal.toFixed(2)
          });
        }
      });
    }
  });


  const profitAmount = totalCost * (formData.profit_percentage / 100);
  const costWithProfit = totalCost + profitAmount;
  const finalPriceWithTaxes = (costWithProfit * (formData.taxes / 100)) + costWithProfit;

 

  const rows: (string | number)[][] = [];


  rows.push(['style', formData.style]);
  rows.push(['dimensions', formData.dimensions]);
  rows.push([]);


  rows.push(['--- Materiais Utilizados ---']);
  rows.push(['id', 'name', 'quantity', 'unity', 'subtotal']);
  usedMaterials.forEach(material => {
    rows.push([
      material.id,
      material.name,
      material.quantity,
      material.unity,
      material.subtotal
    ]);
  });
  rows.push([]);


  rows.push(['--- Resumo Financeiro ---']);
  rows.push(['custo_total', totalCost.toFixed(2)]);
  rows.push(['profit_percentage', `${formData.profit_percentage}%`]);
  rows.push(['custo_total_com_lucro', costWithProfit.toFixed(2)]);
  rows.push(['taxes', `${formData.taxes}%`]);
  rows.push(['custo_total_com_lucro_e_imposto', finalPriceWithTaxes.toFixed(2)]);
  


  const csvContent = rows.map(e => e.join(",")).join("\n");

  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
  
  link.setAttribute("href", url);
  link.setAttribute("download", `bolsa_${formData.style.replace(/\s+/g, '_')}_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};