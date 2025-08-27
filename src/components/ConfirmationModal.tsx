import { useMemo } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { formatCurrency } from "@/lib/utils";
import type { BagForm, MaterialDetails } from '@/types';
import { ScrollArea } from './ui/scroll-area';
import { generateCraftCsv } from '@/lib/csvGenerator';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface ProcessedItem extends MaterialDetails {
  id: string;
  quantity: number;
  subtotal: number;
}

export function ConfirmationModal({ isOpen, onClose }: Props) {
  const { watch, control, handleSubmit } = useFormContext<BagForm>();
  const { materialsState } = useRawMaterials();
  const formData = watch();

  const handleFinalSubmit = (data: BagForm) => {
    console.log("Submetendo e gerando CSV com os dados:", data);
    generateCraftCsv(data, materialsState);
    onClose();
  };

  const { processedItems, totalCost } = useMemo(() => {
    if (!formData) return { processedItems: [], totalCost: 0 };
    let runningTotal = 0;
    const items: ProcessedItem[] = [];
    const categories: Array<keyof Omit<BagForm, 'style' | 'dimensions' | 'profit_percentage' | 'taxes' | 'created_at'>> = ['primary', 'secondary', 'extra'];
    categories.forEach(categoryKey => {
      const categoryItems = formData[categoryKey];
      if (categoryItems) {
        Object.entries(categoryItems).forEach(([itemId, itemData]) => {
          const quantityAsNumber = parseFloat(String(itemData.quantity)) || 0;
          if (quantityAsNumber > 0) {
            const fullItemData = materialsState[categoryKey][itemId];
            const subtotal = fullItemData.cost * quantityAsNumber;
            runningTotal += subtotal;
            items.push({ ...fullItemData, id: itemId, quantity: quantityAsNumber, subtotal });
          }
        });
      }
    });
    return { processedItems: items, totalCost: runningTotal };
  }, [formData, materialsState]);

  const profitPercentage = parseFloat(String(watch('profit_percentage'))) || 0;
  const taxes = parseFloat(String(watch('taxes'))) || 0;
  const profitAmount = totalCost * (profitPercentage / 100);
  const costWithProfit = totalCost + profitAmount;
  const finalPriceWithTaxes = (costWithProfit * (taxes / 100)) + costWithProfit;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Resumo Final e Preço</DialogTitle>
          <p className="text-muted-foreground pt-2">Modelo: <span className="font-semibold text-primary">{formData.style}</span></p>
        </DialogHeader>
        <ScrollArea className="h-72 w-full rounded-md border p-4">
          <h3 className="mb-4 font-semibold text-center">Itens Utilizados</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Item</th>
                <th className="text-right p-2">Quantidade</th>
                <th className="text-right p-2">Custo Unitário</th>
                <th className="text-right p-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {processedItems.length > 0 ? (
                processedItems.map(item => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2 font-medium">{item.name}</td>
                    <td className="text-right p-2">{item.quantity} {item.unity}</td>
                    <td className="text-right p-2">{formatCurrency(item.cost)}</td>
                    <td className="text-right p-2 font-semibold">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-muted-foreground p-4">Nenhum material adicionado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </ScrollArea>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div>
              <Label htmlFor="profit">Margem de Lucro (%)</Label>
              <Controller name="profit_percentage" control={control}
                render={({ field }) => (
                  <Input {...field} id="profit" type="text" inputMode="decimal" placeholder="0" className='mt-2'
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^(\d+([,.]\d*)?|[,.]\d*)?$/.test(value)) {
                        field.onChange(value);
                      }
                    }}
                  />
                )}
              />
            </div>
            <div>
              <Label htmlFor="taxes">Impostos (%)</Label>
              <Controller name="taxes" control={control}
                render={({ field }) => (
                  <Input {...field} id="taxes" type="text" inputMode="decimal" placeholder="0" className='mt-2'
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^(\d+([,.]\d*)?|[,.]\d*)?$/.test(value)) {
                        field.onChange(value);
                      }
                    }}
                  />
                )}
              />
            </div>
          </div>
          <div className="space-y-2 rounded-lg bg-muted/50 p-4">
            <div className="flex justify-between items-center text-lg"><span>Custo Total de Produção:</span><span className="font-semibold">{formatCurrency(totalCost)}</span></div>
            <div className="flex justify-between items-center text-lg"><span>Lucro ({profitPercentage}%):</span><span className="font-semibold text-green-600">{formatCurrency(profitAmount)}</span></div>
            <div className="flex justify-between items-center text-xl font-bold border-t pt-2 mt-2"><span>Preço de Venda (sem impostos):</span><span>{formatCurrency(costWithProfit)}</span></div>
            <div className="flex justify-between items-center text-xl font-bold border-t pt-2 mt-2"><span>Preço Final (com impostos de {taxes}%):</span><span className="text-primary">{formatCurrency(finalPriceWithTaxes)}</span></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>Voltar</Button>
          <Button
            type="button"
            onClick={handleSubmit(handleFinalSubmit)}
          >
            Confirmar e Salvar Bolsa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}