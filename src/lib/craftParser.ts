import type { BagForm, MaterialsState } from "@/types";

export const parseCraftCsv = (
  csvString: string,
  materialsState: MaterialsState
): { bagFormData: Partial<BagForm>, costList: { id: string, cost: number }[] } => {
 console.log("CSV recebido para parsing:", csvString, materialsState);
  const lines = csvString.split('\n').map(line => line.trim().replace(/\r/g, ""));

  const parsedData: Partial<BagForm> = {
    primary: {},
    secondary: {},
    extra: {},
  };

  const costList: { id: string, cost: number }[] = [];

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
      const value = parts.slice(1).join(',').replace(/"/g, '') || '';

      if (key === 'style' || key === 'dimensions' || key === 'bag_quantity') {
        parsedData[key] = value;
      }

      if (key === 'created_at') {
        const date = new Date(value);

        if (!isNaN(date.getTime())) {
          parsedData[key] = date;
        } else {
          console.warn(`A data "${value}" não pôde ser lida e foi substituída pela data atual.`);
          parsedData[key] = new Date();
        }
      }
    }

    if (currentSection === 'materials') {

      const [id, , category, cost, quantity] = parts;

      if (id && id.trim() !== 'id') {
        const trimmedId = id.trim();
        const categoryValue = category?.replace(/"/g, '').trim() as keyof MaterialsState;
        const costAsNumber = parseFloat(cost);

        const quantityValue = quantity?.replace(/"/g, '').trim() || '0';

        costList.push({
          id: trimmedId,
          cost: isNaN(costAsNumber) ? 0 : costAsNumber
        });

          if (categoryValue && parsedData[categoryValue]) {
          if (categoryValue === 'extra') {
            (parsedData.extra![trimmedId] as any) = { cost: costAsNumber };
          } else {
            (parsedData[categoryValue]![trimmedId] as any) = { quantity: quantityValue };
          }
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
  console.log("Dados do formulário parseados:", parsedData, costList);
  return { bagFormData: parsedData, costList };
};