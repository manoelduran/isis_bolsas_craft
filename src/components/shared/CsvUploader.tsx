import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { parseCraftCsv } from '@/lib/craftParser';
import type { BagForm } from '@/types';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { useRawMaterials } from '@/hooks/useRawMaterials';

interface Props {
  onFullCraftLoad: (data: Partial<BagForm>) =>  void;
  onCostListLoad: (costs: { id: string; cost: number; unity?: string }[]) => void;
}

export function CsvUploader({ onFullCraftLoad, onCostListLoad }: Props) {
  const { materialsState } = useRawMaterials();
  const [message, setMessage] = useState('Importe um template (.csv ou .xlsx)');
  const [isError, setIsError] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage(`Processando ${file.name}...`);
    setIsError(false);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const fileContent = e.target?.result;
        if (!fileContent) throw new Error("Não foi possível ler o arquivo.");

        let csvString: string;
        if (file.name.endsWith('.xlsx')) {
          const workbook = XLSX.read(fileContent, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          csvString = XLSX.utils.sheet_to_csv(worksheet);
        } else {
          csvString = fileContent as string;
        }

        if (csvString.trim().startsWith('style,')) {
          console.log("Detectado: Arquivo de Craft Completo (para edição).");
          const parsedData = parseCraftCsv(csvString, materialsState);
          onFullCraftLoad(parsedData);
        }

        else if (csvString.trim().toLowerCase().startsWith('id,name,cost')) {
          console.log("Detectado: Template de Custos (para novo craft).");
          Papa.parse(csvString, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const costList = results.data.map((row: any) => {
                const costString = String(row.cost || '0').replace(',', '.');
                const costAsNumber = parseFloat(costString);
                return {
                  id: row.id,
                  cost: isNaN(costAsNumber) ? 0 : costAsNumber,
                  unity: row.unity || 'm'
                };
              }).filter(item => item.id);
              onCostListLoad(costList);
            }
          });
        } else {
          throw new Error("Formato de arquivo não reconhecido.");
        }
        
        setMessage(`"${file.name}" carregado com sucesso!`);
        setIsError(false);

      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Erro ao processar o arquivo.");
        setIsError(true);
      }
    };

    if (file.name.endsWith('.xlsx')) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  return (
      <div className="grid w-full max-w-sm items-center gap-1.5 p-4 border-2 border-dashed rounded-lg">
          <Label htmlFor="csv-upload">Importar Arquivo de Craft</Label>
          <Input id="csv-upload" type="file" accept=".csv, .xlsx" onChange={handleFileChange} />
          <p className={`text-sm mt-2 ${isError ? 'text-red-500' : 'text-muted-foreground'}`}>
              {message}
          </p>
      </div>
  );
}