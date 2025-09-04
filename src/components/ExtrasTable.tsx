import { useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRawMaterials } from '@/hooks/useRawMaterials';
// import { formatCurrency } from '@/lib/utils';
import type { BagForm } from '@/types';

export const ExtrasTable = () => {

  const { watch, control, setValue } = useFormContext<BagForm>();

  const { materialsState } = useRawMaterials();

  const extraItems = materialsState.extra;


  const costuraCost = watch('extra.costura.cost');
   const costuraQuantity = watch('extra.costura.quantity');
    console.log("Custo da Costura:", costuraCost, costuraQuantity);
  useEffect(() => {
    const costuraCostAsNumber = parseFloat(String(costuraCost)) || 0;
    const commissionValue = costuraCostAsNumber  * 0.10;

    // setValue('extra.comissaoCostura.quantity', '1');
    setValue('extra.comissaoCostura.cost', commissionValue.toFixed(2), {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [costuraCost, setValue]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60%]">Item Extra</TableHead>
          {/* <TableHead>Quantidade</TableHead> */}
          <TableHead>Custo (R$)</TableHead>
          {/* <TableHead className="text-right">Subtotal</TableHead> */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(extraItems).map(([itemId, itemData]) => {

        //   const quantity = parseFloat(String(watch(`extra.${itemId}.quantity`))) || 0;
        //   const cost = parseFloat(String(watch(`extra.${itemId}.cost`))) || 0;
        //   const subtotal = quantity * cost;

          const isCommissionField = itemId === 'comissaoCostura';

          return (
            <TableRow key={itemId}>
              <TableCell className="font-medium">{itemData.name}</TableCell>
              {/* <TableCell>
                <Controller
                  name={`extra.${itemId}.quantity`}
                  control={control}
                  defaultValue="0"
                  render={({ field }) => (
                    <Input {...field} placeholder="0" type="text" inputMode="decimal"
                      readOnly={isCommissionField}
                      className={isCommissionField ? 'bg-muted/50' : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^(\d+([,.]\d*)?|[,.]\d*)?$/.test(value)) { field.onChange(value); }
                      }}
                    />
                  )}
                />
              </TableCell> */}
              <TableCell>
                <Controller
                  name={`extra.${itemId}.cost`}
                  control={control}
      
                  defaultValue={itemData.cost.toFixed(2)}
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
              {/* <TableCell className="text-right font-semibold">
                {formatCurrency(subtotal)}
              </TableCell> */}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};