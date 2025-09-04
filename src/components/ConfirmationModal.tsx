import { useMemo } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  quantity?: number;
  subtotal?: number;
}

export function ConfirmationModal({ isOpen, onClose }: Props) {
  const { watch, control, handleSubmit } = useFormContext<BagForm>();
  const { materialsState } = useRawMaterials();
  const formData = watch();

  const handleFinalSubmit = (data: BagForm) => {
    generateCraftCsv(data, materialsState);
    onClose();
  };
  const bagQuantity = parseInt(String(watch('bag_quantity'))) || 1;
  const { baseItems, extraItems, baseCostPerBag, extraCost } = useMemo(() => {
    if (!formData) return { baseItems: [], extraItems: [], baseCostPerBag: 0, extraCost: 0 };

    let runningBaseCost = 0;
    let runningExtraCost = 0;
    const bItems: ProcessedItem[] = [];
    const eItems: ProcessedItem[] = [];


    ['primary', 'secondary'].forEach(categoryKey => {
      const categoryItems = formData[categoryKey as 'primary' | 'secondary'];
      if (categoryItems) {
        Object.entries(categoryItems).forEach(([itemId, itemData]) => {
          const quantityAsNumber = parseFloat(String(itemData.quantity)) || 0;
          if (quantityAsNumber > 0) {
            const fullItemData = materialsState[categoryKey as 'primary' | 'secondary'][itemId];
            const subtotal = fullItemData.cost * quantityAsNumber;
            runningBaseCost += subtotal;
            bItems.push({ ...fullItemData, id: itemId, quantity: quantityAsNumber * bagQuantity, subtotal: subtotal * bagQuantity});
          }
        });
      }
    });

    const extraCategoryItems = formData.extra;
    if (extraCategoryItems) {
      Object.entries(extraCategoryItems).forEach(([itemId, itemData]) => {
          const fullItemData = materialsState.extra[itemId];
          const costAsNumber = parseFloat(String(itemData.cost)) || 0;
          runningExtraCost += costAsNumber;
          eItems.push({ ...fullItemData, id: itemId,cost: costAsNumber * bagQuantity });
      });
    }

    return { baseItems: bItems, extraItems: eItems, baseCostPerBag: runningBaseCost, extraCost: runningExtraCost * bagQuantity };
  }, [formData, materialsState]);


  const profitPercentage = parseFloat(String(watch('profit_percentage'))) || 0;
  const taxes = parseFloat(String(watch('taxes'))) || 0;

  const totalMaterialCost = baseCostPerBag * bagQuantity;
  const grandTotalCost = totalMaterialCost + extraCost;
  const profitAmount = grandTotalCost * (profitPercentage / 100);
  const costWithProfit = grandTotalCost + profitAmount;
  const finalPriceWithTaxes = (costWithProfit * (taxes / 100)) + costWithProfit;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Resumo Final e Preço</DialogTitle>
          <p className="text-muted-foreground pt-2">Modelo: <span className="font-semibold text-primary">{formData.style}</span></p>
        </DialogHeader>

        <Tabs defaultValue="materials" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="materials">Materiais da Bolsa</TabsTrigger>
            <TabsTrigger value="extras">Custos Extras</TabsTrigger>
          </TabsList>
          <TabsContent value="materials" className="mt-4">
            <ScrollArea className="h-60 w-full rounded-md border p-4">
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
                  {baseItems.length > 0 ? baseItems.map(item => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2 font-medium">{item.name}</td>
                      <td className="text-right p-2">{item.quantity?.toFixed(2)} {item.unit}</td>
                      <td className="text-right p-2">{formatCurrency(item.cost)}</td>
                      <td className="text-right p-2 font-semibold">{formatCurrency(item.subtotal as number)}</td>
                    </tr>
                  )) : <tr><td colSpan={4} className="text-center p-4 text-muted-foreground">Nenhum material principal/secundário adicionado.</td></tr>}
                </tbody>
              </table>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="extras" className="mt-4">
            <ScrollArea className="h-60 w-full rounded-md border p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Item</th>
                    {/* <th className="text-right p-2">Quantidade</th> */}
                    <th className="text-right p-2">Custo</th>
                    {/* <th className="text-right p-2">Subtotal</th> */}
                  </tr>
                </thead>
                <tbody>
                  {extraItems.length > 0 ? extraItems.map(item => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2 font-medium">{item.name}</td>
                      {/* <td className="text-right p-2">{item.quantity} {item.unit}</td> */}
                      <td className="text-right p-2">{formatCurrency(item.cost)}</td>
                      {/* <td className="text-right p-2 font-semibold">{formatCurrency(item.subtotal)}</td> */}
                    </tr>
                  )) : <tr><td colSpan={4} className="text-center p-4 text-muted-foreground">Nenhum custo extra adicionado.</td></tr>}
                </tbody>
              </table>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="profit">Margem de Lucro (%)</Label>
              <Controller name="profit_percentage" control={control}
                render={({ field }) => (<Input {...field} id="profit" type="text" inputMode="decimal" placeholder="0" className='mt-2' onChange={(e) => { const value = e.target.value; if (/^(\d+([,.]\d*)?|[,.]\d*)?$/.test(value)) { field.onChange(value); } }} />)}
              />
            </div>
            <div>
              <Label htmlFor="taxes">Impostos (%)</Label>
              <Controller name="taxes" control={control}
                render={({ field }) => (<Input {...field} id="taxes" type="text" inputMode="decimal" placeholder="0" className='mt-2' onChange={(e) => { const value = e.target.value; if (/^(\d+([,.]\d*)?|[,.]\d*)?$/.test(value)) { field.onChange(value); } }} />)}
              />
            </div>
          </div>

          <div className="space-y-2 rounded-lg bg-muted/50 p-4 text-sm">
            <div className="flex justify-between items-center gap-2">
              <span>Custo por Bolsa (Materiais):</span><span className="font-semibold">{formatCurrency(baseCostPerBag)}</span>
              <div>
                <Controller name="bag_quantity" control={control}
                  render={({ field }) => (
                    <Input {...field} id="bag_quantity" type="text" inputMode="numeric" placeholder="Quantidade"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) { field.onChange(value); }
                      }}
                    />
                  )}
                />
              </div>
            </div>
            <div className="flex justify-between items-center font-medium border-t pt-2 mt-2"><span>Custo Total dos Materiais:</span><span className="font-semibold">{formatCurrency(totalMaterialCost)}</span></div>
            <div className="flex justify-between items-center"><span>(+) Custos Extras Fixos:</span><span className="font-semibold">{formatCurrency(extraCost)}</span></div>
            <div className="flex justify-between items-center text-sm font-bold border-t pt-2 mt-2"><span>Custo Total de Produção:</span><span className="font-semibold">{formatCurrency(grandTotalCost)}</span></div>
            <div className="flex justify-between items-center text-md"><span>(+) Lucro ({profitPercentage}%):</span><span className="font-semibold text-green-600">{formatCurrency(profitAmount)}</span></div>
            <div className="flex justify-between items-center text-md font-bold border-t pt-2 mt-2"><span>Preço de Venda (sem impostos):</span><span>{formatCurrency(costWithProfit)}</span></div>
            <div className="flex justify-between items-center text-md font-bold"><span>Preço Final (com impostos de {taxes}%):</span><span className="text-primary">{formatCurrency(finalPriceWithTaxes)}</span></div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>Voltar</Button>
          <Button type="button" onClick={handleSubmit(handleFinalSubmit)}>
            Confirmar e Salvar Bolsa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}