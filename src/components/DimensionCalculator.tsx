import { useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, PlusCircle, Trash2 } from "lucide-react";

type CalculationRow = {
  id: number;
  material: string;
  width: string;
  height: string;
  thickness: string;
};

export const DimensionCalculator = () => {
  const [rows, setRows] = useState<CalculationRow[]>([
    { id: Date.now(), material: '', width: '', height: '', thickness: '' }
  ]);

  const addRow = () => {
    setRows([...rows, { id: Date.now(), material: '', width: '', height: '', thickness: '' }]);
  };

  const removeRow = (id: number) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const updateRow = (id: number, field: keyof Omit<CalculationRow, 'id'>, value: string) => {
    setRows(rows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

   const { sumOfTotals, finalResult } = useMemo(() => {
    const sum = rows.reduce((acc, row) => {
      const total = 
        (parseFloat(row.width) || 0) * (parseFloat(row.height) || 0) * (parseFloat(row.thickness) || 0);
      return acc + total;
    }, 0);

    const final = sum / 150 / 100;

    return {
      sumOfTotals: sum,
      finalResult: final
    };
  }, [rows]);

  return (
    <Popover >
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon"  aria-label="Abrir calculadora de dimensões">
          <Calculator className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[600px] p-4 mr-10 mt-2">
        <div className="space-y-4">
          <h4 className="font-medium leading-none">Calculadora de Dimensões</h4>
          <p className="text-sm text-muted-foreground">
            Use esta tabela para calcular totais. Os dados não são salvos no formulário principal.
          </p>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Material</TableHead>
                  <TableHead>Largura</TableHead>
                  <TableHead>Altura</TableHead>
                  <TableHead>Espessura</TableHead>
                  <TableHead className="text-right">Total (cm³)</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const total =
                    (parseFloat(row.width) || 0) * (parseFloat(row.height) || 0) * (parseFloat(row.thickness) || 0);

                  return (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Input value={row.material} onChange={(e) => updateRow(row.id, 'material', e.target.value)} />
                      </TableCell>
                      <TableCell>
                        <Input value={row.width} onChange={(e) => updateRow(row.id, 'width', e.target.value)} inputMode="decimal" />
                      </TableCell>
                      <TableCell>
                        <Input value={row.height} onChange={(e) => updateRow(row.id, 'height', e.target.value)} inputMode="decimal" />
                      </TableCell>
                      <TableCell>
                        <Input value={row.thickness} onChange={(e) => updateRow(row.id, 'thickness', e.target.value)} inputMode="decimal" />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeRow(row.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <Button variant="outline" onClick={addRow} className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Linha
          </Button>
             <div className="space-y-2 rounded-lg bg-muted/50 p-3 text-sm">
            <div className="flex justify-between items-center font-medium">
              <span>Somatório dos Totais (cm³):</span>
              <span>{sumOfTotals.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center font-bold text-base border-t pt-2 mt-2">
              <span>Resultado Final:</span>
              <span className="text-primary">{finalResult.toFixed(4)}</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};