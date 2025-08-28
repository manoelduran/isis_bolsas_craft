import type { BagForm, MaterialsState } from "@/types";


export const parseCraftCsv = (csvString: string, materialsState: MaterialsState): { bagFormData: Partial<BagForm>, costList: { id: string, cost: number, unit: string }[] } => {
  const lines = csvString.split('\n').map(line => line.trim());

  const parsedData: Partial<BagForm> = {
    primary: {},
    secondary: {},
    extra: {},
  };
  const costList: { id: string, cost: number, unit: string }[] = [];
  const primaryIds = new Set(Object.keys(materialsState.primary));
  const secondaryIds = new Set(Object.keys(materialsState.secondary));
  const extraIds = new Set(Object.keys(materialsState.extra));

  let currentSection: 'meta' | 'materials' | 'summary' | null = 'meta';

  lines.forEach(line => {
    if (!line) return;
    if (line.includes('--- Materiais Utilizados ---')) {
      currentSection = 'materials';
      return;
    }
    if (line.includes('--- Resumo Financeiro ---')) {
      currentSection = 'summary';
      return;
    }

    const parts = line.split(',');

    if (currentSection === 'meta') {
      const key = parts[0] as keyof BagForm;
      const value = parts[1]?.replace(/"/g, '') || '';
      if (key === 'style' || key === 'dimensions') {
        parsedData[key] = value;
      }
      if (key === 'created_at') {
        parsedData[key] = new Date(value);
      }
    }

    if (currentSection === 'materials') {
      const [id, , cost, quantity, unit] = parts;
      if (id && id !== 'id') {
        const costString = cost?.replace(/"/g, '').replace(',', '.') || '0';
        const costAsNumber = parseFloat(costString);
        const quantityValue = quantity?.replace(/"/g, '') || '0';
        const unitValue = unit?.replace(/"/g, '') || 'un';
        costList.push({
          id: id.trim(),
          cost: isNaN(costAsNumber) ? 0 : costAsNumber,
          unit: unitValue
        });
        if (primaryIds.has(id)) {
          parsedData.primary![id] = { quantity: quantityValue };
        } else if (secondaryIds.has(id)) {
          parsedData.secondary![id] = { quantity: quantityValue };
        } else if (extraIds.has(id)) {
          parsedData.extra![id] = { quantity: quantityValue };
        }
      }
    }

    if (currentSection === 'summary') {
      const key = parts[0] as keyof BagForm;
      const value = parts[1]?.replace(/"/g, '').replace('%', '') || '0';
      if (key === 'profit_percentage' || key === 'taxes') {
        parsedData[key] = value;
      }
    }
  });

  return { bagFormData: parsedData, costList };
};