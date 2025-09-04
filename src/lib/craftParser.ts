import type { BagForm, MaterialsState } from "@/types";



export const parseCraftCsv = (
  csvString: string, 
  materialsState: MaterialsState
): { bagFormData: Partial<BagForm>, costList: { id: string, cost: number, unit: string }[] } => {
  
  // Limpa as linhas, removendo espaços e o caractere de retorno de carro (\r)
  const lines = csvString.split('\n').map(line => line.trim().replace(/\r/g, ""));
  
  const parsedData: Partial<BagForm> = {
    primary: {},
    secondary: {},
    extra: {},
  };
  // Corrigido para 'unit' para consistência
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
      const value = parts.slice(1).join(',').replace(/"/g, '') || '';

      if (key === 'style' || key === 'dimensions') {
        parsedData[key] = value;
      }
      
      if (key === 'created_at') {
        const date = new Date(value);
        // Validação robusta para datas
        if (!isNaN(date.getTime())) {
          parsedData[key] = date;
        } else {
          console.warn(`A data "${value}" não pôde ser lida e foi substituída pela data atual.`);
          parsedData[key] = new Date();
        }
      }
    }

    if (currentSection === 'materials') {
      // --- CORREÇÃO NA ORDEM DAS COLUNAS ---
      // O formato correto é: id, name, cost, unit, quantity
      const [id, cost, unit, quantity] = parts;

      if (id && id.trim() !== 'id') {
        const costString = cost?.replace(/"/g, '').replace(',', '.') || '0';
        const costAsNumber = parseFloat(costString);
        
        // As variáveis agora pegam os valores das colunas corretas
        const unitValue = unit?.replace(/"/g, '').trim() || 'un';
        const quantityValue = quantity?.replace(/"/g, '').trim() || '0';

        costList.push({
          id: id.trim(),
          cost: isNaN(costAsNumber) ? 0 : costAsNumber,
          unit: unitValue
        });
        
        const trimmedId = id.trim();
        if (primaryIds.has(trimmedId)) {
            parsedData.primary![trimmedId] = { quantity: quantityValue };
        } else if (secondaryIds.has(trimmedId)) {
            parsedData.secondary![trimmedId] = { quantity: quantityValue };
        } else if (extraIds.has(trimmedId)) {
            parsedData.extra![trimmedId] = { 
              cost: costAsNumber 
            };
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