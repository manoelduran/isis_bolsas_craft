import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRawMaterials } from "@/hooks/useRawMaterials";
import { formatCurrency } from "@/lib/utils";
import { generateCraftCsv } from "@/lib/csvGenerator";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: Record<string, number> | null;
}

export function ConfirmationModal({ isOpen, onClose, data }: Props) {
  const { materials } = useRawMaterials();

  if (!data) return null;

  const materialMap = new Map(materials.map(m => [m.id, m]));
  const craftItems = Object.entries(data)
    .filter(([, quantity]) => quantity > 0)
    .map(([id, quantity]) => ({
      material: materialMap.get(id)!,
      quantity,
    }));

  const totalCost = craftItems.reduce((acc, item) => {
    return acc + (item.material.cost * item.quantity);
  }, 0);

  const handleCraft = () => {
    generateCraftCsv(data, materials);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Confirmação do Craft</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <ScrollArea className="h-96 w-full rounded-md border p-4">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Item</th>
                  <th className="text-right p-2">Qtd.</th>
                  <th className="text-right p-2">Custo Unit.</th>
                  <th className="text-right p-2">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {craftItems.map(item => (
                  <tr key={item.material.id} className="border-b">
                    <td className="p-2">{item.material.name}</td>
                    <td className="text-right p-2">{item.quantity}</td>
                    <td className="text-right p-2">{formatCurrency(item.material.cost)}</td>
                    <td className="text-right p-2 font-semibold">{formatCurrency(item.material.cost * item.quantity)}</td>
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