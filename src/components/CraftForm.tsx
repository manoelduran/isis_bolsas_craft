import { useForm, FormProvider } from 'react-hook-form';
import { FormFieldGamified } from './FormFieldGamified';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { ConfirmationModal } from './ConfirmationModal';
 interface CraftFormData {
    [materialId: string]: number;
  }
export const CraftForm = () => {
  const { materials } = useRawMaterials();
  const [formData, setFormData] = useState<CraftFormData | null>(null);
  const methods = useForm({

    defaultValues: materials.reduce<Record<string, number>>((acc, material) => {
      acc[material.id] = 0;
      return acc;
    }, {})
  });

 

  const onSubmit = (data: CraftFormData) => {
    console.log("Form Submitted:", data);
    setFormData(data);
  };

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
              <FormFieldGamified key={material.id} material={material} />
            ))}
          </div>
          <div className="flex justify-end">
            <Button size="lg" type="submit">
              Calcular e Criar Bolsa
            </Button>
          </div>
        </form>
      </FormProvider>

      <ConfirmationModal
        isOpen={!!formData}
        onClose={() => setFormData(null)}
        data={formData}
      />
    </>
  );
};