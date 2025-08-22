import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BagStyleSelect, BagStyle } from './BagStyleSelect';
import { FormSection } from './FormSection';
import { ConfirmationModal } from './ConfirmationModal';


type FullFormData = {
  style: string;
  primary: Record<string, { quantity: number }>;
  secondary: Record<string, { quantity: number }>;
  extra: Record<string, { quantity: number }>;
};

export const CraftForm = () => {
  const { craftState } = useRawMaterials();

  const [modalData, setModalData] = useState<FullFormData | null>(null);

  const methods = useForm<FullFormData>({
    defaultValues: {
      style: BagStyle.Tote,

    }
  });


  const onSubmit = (data: FullFormData) => {
    console.log("Formulário Final:", data);
    setModalData(data);
  };

  return (

    <>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
          <BagStyleSelect />

          <h2 className="text-lg font-semibold">2. Matérias-Primas</h2>
          <Tabs defaultValue="primary" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="primary">Principal</TabsTrigger>
              <TabsTrigger value="secondary">Secundários</TabsTrigger>
              <TabsTrigger value="extra">Extras</TabsTrigger>
            </TabsList>

            <TabsContent value="primary" className="mt-6">
              <FormSection category="primary" items={craftState.primary} />
            </TabsContent>
            <TabsContent value="secondary" className="mt-6">
              <FormSection category="secondary" items={craftState.secondary} />
            </TabsContent>
            <TabsContent value="extra" className="mt-6">
              <FormSection category="extra" items={craftState.extra} />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button size="lg" type="submit">Calcular e Criar</Button>
          </div>
        </form>
      </FormProvider>

      <ConfirmationModal
        isOpen={!!modalData}
        data={modalData}
        onClose={() => setModalData(null)}
      />
    </>
  );
};