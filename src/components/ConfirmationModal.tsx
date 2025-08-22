import { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { formatCurrency } from "@/lib/utils";
import { generateCraftCsv } from "@/lib/csvGenerator";
import type { CraftItem } from '@/types';


type FinalFormData = {
  style: string;
  primary: Record<string, { quantity: number }>;
  secondary: Record<string, { quantity: number }>;
  extra: Record<string, { quantity: number }>;
} | null;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: FinalFormData;
}


interface ProcessedItem extends CraftItem {
  id: string;
  category: string;
  subtotal: number;
}

export function ConfirmationModal({ isOpen, onClose, data }: Props) {

  const { craftState } = useRawMaterials();


  const { processedItems, totalCost } = useMemo(() => {
    if (!data) return { processedItems: [], totalCost: 0 };

    const items: ProcessedItem[] = [];
    let runningTotal = 0;

    Object.entries(data).forEach(([categoryKey, categoryData]) => {
      if (categoryKey === 'style') return;

      Object.entries(categoryData).forEach(([itemId, item]) => {
        if (item.quantity > 0) {
          const fullItemData = craftState[categoryKey as keyof typeof craftState][itemId];
          const subtotal = fullItemData.cost * item.quantity;
          runningTotal += subtotal;

          items.push({
            ...fullItemData,
            id: itemId,
            category: categoryKey,
            quantity: item.quantity,
            subtotal,
          });
        }
      });
    });

    return { processedItems: items, totalCost: runningTotal };
  }, [data, craftState]);

  if (!data) return null;

  const handleCraft = () => {
    generateCraftCsv(data, craftState);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Confirmação do Craft</DialogTitle>
          <p className="text-muted-foreground pt-2">
            Resumo para o modelo: <span className="font-semibold text-primary">{data.style}</span>
          </p>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <ScrollArea className="h-96 w-full rounded-md border p-4">
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
                {processedItems.map(item => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2 font-medium">{item.name}</td>
                    <td className="text-right p-2">{item.quantity} {item.unity}</td>
                    <td className="text-right p-2">{formatCurrency(item.cost)}</td>
                    <td className="text-right p-2 font-semibold">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
          <div className="text-right text-2xl font-bold mt-4">
            <span>Custo Total: </span>
            <span className="text-primary">{formatCurrency(totalCost)}</span>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Voltar</Button>
          </DialogClose>
          <Button onClick={handleCraft}>Confirmar e Gerar CSV</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}