import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { CraftItem } from '@/types';

interface Props {
  category: "primary" | "secondary" | "extra";
  itemId: string;
  itemData: CraftItem;
}

export const FormFieldGamified = ({ category, itemId, itemData }: Props) => {
  const { control, watch } = useFormContext();

  const fieldName = `${category}.${itemId}.quantity`;

  const quantity = watch(fieldName) || 0;
  const total = quantity * itemData.cost;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{itemData.name}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Custo: {formatCurrency(itemData.cost)}
        </p>
      </CardHeader>
      <CardContent>
        <Label htmlFor={fieldName}>Quantidade</Label>
        <Controller
          name={fieldName}
          control={control}
          defaultValue={0}
          render={({ field }) => (
            <div className="relative mt-2">
              <Input
                {...field}
                id={fieldName}
                type="text"
                inputMode="decimal"
                className="pr-14" 
                placeholder="0"
                onChange={(e) => {
                  const value = e.target.value.replace(',', '.');
                  field.onChange(parseFloat(value) || 0);
                }}
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-muted-foreground sm:text-sm">
                  {itemData.unity}
                </span>
              </div>
            </div>
          )}
        />
      </CardContent>
      <CardFooter className="flex justify-end">
        <motion.div key={total} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-lg font-bold text-primary">{formatCurrency(total)}</p>
        </motion.div>
      </CardFooter>
    </Card>
  );
};