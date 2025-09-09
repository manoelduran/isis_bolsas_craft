import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { MaterialDetails } from '@/types';


interface Props {
  category: "primary" | "secondary" | "extra";
  itemId: string;
  itemData: MaterialDetails;
}

export const FormFieldGamified = ({ category, itemId, itemData }: Props) => {
  const { control, watch } = useFormContext();
  const quantityFieldName = `${category}.${itemId}.quantity`;
  console.log("Renderizando FormFieldGamified para:", itemId, itemData);
  const quantity = parseFloat(String(watch(quantityFieldName))) || 0;
  const subtotal = quantity * (itemData.cost as number) ;

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle>{itemData.name}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Custo: {formatCurrency(itemData.cost as number)}
        </p>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor={quantityFieldName}>Quantidade</Label>
          <div className="relative mt-2">
         <Controller
              name={quantityFieldName}
              control={control}
              defaultValue={"0"}
              render={({ field }) => (
                <Input
                  {...field}
                  id={quantityFieldName}
                  type="text"
                  inputMode="decimal"
                  className="pr-14"
                  placeholder="0"
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
      </CardContent>
      <CardFooter className="flex justify-end p-4 rounded-b-lg">
        <div>
          <p className="text-xs text-muted-foreground">Subtotal</p>
          <motion.p key={subtotal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg font-bold">
            {formatCurrency(subtotal)}
          </motion.p>
        </div>
      </CardFooter>
    </Card>
  );
};