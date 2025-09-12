import type { BagForm, MaterialsState } from "@/types";
import { toast } from "sonner";
import { sanitizeForFilename, formatMaterialName, downloadCsvLocally, findOrCreateFolder } from "./utils";

export const generateCraftCsv = async (formData: BagForm, materialsState: MaterialsState, accessToken: string) => {

  let baseCostPerBag = 0;
  let extraCost = 0;
  const usedMaterials: { id: string, name: string, category: string, cost: number, quantity: number | string }[] = [];

  const bagQuantity = parseInt(String(formData.bag_quantity)) || 1;
  const observation = formData.observation;
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
  rows.push(['observation', `"${observation}"`]);
  rows.push(['bag_quantity', bagQuantity]);
  rows.push([]);

  rows.push(['--- Materiais Utilizados ---']);
  rows.push(['id', 'name', 'category', 'cost', 'quantity']);
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
  const sanitizedStyle = sanitizeForFilename(formData.style || 'bolsa_sem_nome');
  const sanitizedDimensions = (formData.dimensions || 'sem_dimensoes').replace(/\s*x\s*/g, '_').replace(/[^a-z0-9_]/g, '');
  const filename = `${sanitizedStyle}_${sanitizedDimensions}.csv`;

  if (!accessToken) {
    toast.warning("Login não detectado", {
      description: "O arquivo será baixado localmente.",
    });
    downloadCsvLocally(csvContent, filename);
    return;
  }



  try {
    const date = new Date(formData.created_at);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mês de 0-11 para 1-12
    const day = date.getDate().toString().padStart(2, '0');

    const rootFolderId = await findOrCreateFolder('bolsas', 'root', accessToken);
    const yearFolderId = await findOrCreateFolder(year, rootFolderId, accessToken);
    const monthFolderId = await findOrCreateFolder(month, yearFolderId, accessToken);
    const dayFolderId = await findOrCreateFolder(day, monthFolderId, accessToken);

    const metadata = { name: filename, parents: [dayFolderId] };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }));

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}` },
      body: form,
    });

    if (!response.ok) throw new Error('Falha no upload para o Google Drive.');

    await response.json();
    toast.success("Bolsa salva com sucesso!", {
      description: `O arquivo "${filename}" foi enviado para a pasta correta no seu Google Drive.`,
      duration: 5000,
    });
  } catch (error) {
    console.error('Erro ao salvar no Google Drive:', error);
    toast.error("Falha ao salvar no Drive", {
      description: "O arquivo será baixado localmente como alternativa.",
    });
    downloadCsvLocally(csvContent, filename);
  }
};