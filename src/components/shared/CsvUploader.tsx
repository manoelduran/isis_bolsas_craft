import { useRawMaterials } from '@/hooks/useRawMaterials';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Papa from 'papaparse';
import { useState } from 'react';

export function CsvUploader() {
  const { updateMaterialCosts } = useRawMaterials();
  const [message, setMessage] = useState('Nenhum arquivo selecionado.');
  const [isError, setIsError] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMessage(`Processando ${file.name}...`);
      setIsError(false);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const parsedData = results.data
              .map((row: any) => ({
                id: row.id,
                cost: parseFloat(row.cost),
              }))
              .filter(item => item.id && !isNaN(item.cost));

            if (parsedData.length === 0) {
              throw new Error("CSV inválido ou vazio. Verifique se as colunas 'id' e 'cost' existem.");
            }

            updateMaterialCosts(parsedData);
            setMessage(`${parsedData.length} custos carregados com sucesso!`);
          } catch (error) {
            setIsError(true);
            setMessage(error instanceof Error ? error.message : "Ocorreu um erro ao processar o arquivo.");
          }
        },
        error: (error) => {
          setIsError(true);
          setMessage(`Erro no parse do CSV: ${error.message}`);
        }
      });
    }
  };

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5 p-4 border-2 border-dashed rounded-lg">
      <Label htmlFor="csv-upload">Importar CSV de Custos</Label>
      <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} />
      <p className={`text-sm mt-2 ${isError ? 'text-red-500' : 'text-muted-foreground'}`}>
        {message}
      </p>
    </div>
  );
}