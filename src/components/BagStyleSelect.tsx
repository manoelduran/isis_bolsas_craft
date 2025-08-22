import { useFormContext, Controller } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';


export enum BagStyle {
  Tote = 'Bolsa Tote',
  Backpack = 'Mochila',
  Crossbody = 'Bolsa Transversal',
  Clutch = 'Carteira / Clutch',
}

export function BagStyleSelect() {
  const { control } = useFormContext();

  return (
    <div className="mb-8 max-w-sm">
      <Label htmlFor="bagStyle" className="text-lg font-semibold">1. Modelo da Bolsa</Label>
      <Controller
        name="style"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger id="bagStyle" className="mt-2">
              <SelectValue placeholder="Selecione um modelo..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(BagStyle).map(([key, value]) => (
                <SelectItem key={key} value={value}>{value}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
}