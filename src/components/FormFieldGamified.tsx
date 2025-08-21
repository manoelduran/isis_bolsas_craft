import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { RawMaterial } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';

interface Props {
  material: RawMaterial;
}

export const FormFieldGamified = ({ material }: Props) => {
  const { control, watch } = useFormContext();
  const quantity = watch(material.id) || 0;
  const total = quantity * material.cost;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{material.name}</CardTitle>
        <p className="text-sm text-muted-foreground">Custo: {formatCurrency(material.cost)}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        <Label htmlFor={material.id}>Quantidade</Label>
        <Controller
          name={material.id}
          control={control}
          defaultValue={0}
          render={({ field }) => (
            <Input
              {...field}
              id={material.id}
              type="number"
              placeholder="0"
              min="0"
              onChange={(e) => {
                const value = e.target.value;
                field.onChange(value === '' ? 0 : parseInt(value, 10));
              }}
              className="text-lg"
            />
          )}
        />
      </CardContent>
      <CardFooter>
        <div className="w-full text-right">
          <p className="text-muted-foreground text-sm">Subtotal</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={total}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="text-2xl font-bold text-primary"
            >
              {formatCurrency(total)}
            </motion.p>
          </AnimatePresence>
        </div>
      </CardFooter>
    </Card>
  );
};