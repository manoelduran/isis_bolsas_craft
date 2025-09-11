import { useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRawMaterials } from '@/hooks/useRawMaterials';
import type { BagForm } from '@/types';

export const ExtrasTable = () => {

  const { watch, control, setValue } = useFormContext<BagForm>();

  const { materialsState } = useRawMaterials();
  const extraItems = materialsState.extra;


  const costuraCost = watch('extra.extra_costura.cost');

  useEffect(() => {
    const costuraCostAsNumber = parseFloat(String(costuraCost)) || 0;
    const commissionValue = costuraCostAsNumber  * 0.10;

    setValue('extra.extra_comissaoCostura.cost', commissionValue.toFixed(2), {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [costuraCost, setValue]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60%]">Item Extra</TableHead>
          <TableHead>Custo (R$)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(extraItems).map(([itemId, itemData]) => {

          const isCommissionField = itemId === 'extra_comissaoCostura';

          return (
            <TableRow key={itemId}>
              <TableCell className="font-medium">{itemData.name}</TableCell>
              <TableCell>
                <Controller
                  name={`extra.${itemId}.cost`}
                  control={control}
                  defaultValue={(itemData.cost as number).toFixed(2)}
                  render={({ field }) => (
                    <Input {...field} placeholder="0,00" type="text"  inputMode="decimal"
                      readOnly={isCommissionField}
                      className={isCommissionField ? 'bg-muted/50' : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^(\d+([,.]\d*)?|[,.]\d*)?$/.test(value)) { field.onChange(value); }
                      }}
                    />
                  )}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};