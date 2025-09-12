import { useState, useMemo } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormSection } from './FormSection';
import { ExtrasTable } from './ExtrasTable';
import { ConfirmationModal } from './ConfirmationModal';
import { CsvUploader } from './shared/CsvUploader';
import { DimensionInput } from './DimensionInput';
import type { BagForm, MaterialsState } from '@/types';
import { DimensionCalculator } from './DimensionCalculator';
import { Textarea } from './ui/textarea';


export interface CraftFormProps {
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CraftForm = ({ setIsSaving }: CraftFormProps) => {
  const { materialsState, areCostsLoaded, updateMaterialCosts } = useRawMaterials();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullCraftLoaded, setIsFullCraftLoaded] = useState(false);

  const methods = useForm<BagForm>({
    defaultValues: {
      style: '',
      dimensions: '',
      bag_quantity: '1',
      profit_percentage: 0,
      taxes: 0,
      created_at: new Date(),
      observation: '',

    }
  });

  const handleFullCraftLoad = (data: {
    bagFormData: Partial<BagForm>,
    costList: { id: string, cost: number }[]
  }) => {
    updateMaterialCosts(data.costList);
    methods.reset(data.bagFormData);
    setIsFullCraftLoaded(true);
  };
  const handleCostListLoad = (costs: { id: string; cost: number }[]) => {
    updateMaterialCosts(costs);
    setIsFullCraftLoaded(false);
    methods.reset();
  };

  const [activeTab, setActiveTab] = useState('primary');
  const [searchTerm, setSearchTerm] = useState('');


  const filteredItems = useMemo(() => {
    if (!searchTerm) return materialsState;
    const lowercasedFilter = searchTerm.toLowerCase();
    const activeCategoryItems = materialsState[activeTab as keyof MaterialsState];
    const filtered = Object.entries(activeCategoryItems)
      .filter(([, itemData]) => itemData.name.toLowerCase().includes(lowercasedFilter));
    return { ...materialsState, [activeTab]: Object.fromEntries(filtered) };
  }, [searchTerm, materialsState, activeTab]);

  return (
    <>
      <section className="flex justify-center mb-12">
        <CsvUploader
          onFullCraftLoad={handleFullCraftLoad}
          onCostListLoad={handleCostListLoad}
        />
      </section>
      {(areCostsLoaded || isFullCraftLoaded) ? (
        <FormProvider {...methods}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className='w-[300px]'>
                <Label htmlFor="style">Nome da Bolsa</Label>
                <Controller
                  name="style"
                  control={methods.control}
                  render={({ field }) => (
                    <Input {...field} id="style" type="text" placeholder="Ex: Bolsa Tote de Couro" className="mt-2" />
                  )}
                />
                  <div className='mt-3'>
                       <Label htmlFor="observation">Observação</Label>
                         <Controller
                  name="observation"
                  control={methods.control}
                  render={({ field }) => (
                    <Textarea {...field} id="observation" placeholder="Salve alguma observação" className="mt-2"  />
                  )}
                />
                  </div>
              </div>
              <div>
                <Label>Dimensões (cm)</Label>
                <div className='flex items-center justify-center mt-2 gap-2'>
                  <Controller
                    name="dimensions"
                    control={methods.control}
                    render={({ field }) => (
                      <DimensionInput {...field} />
                    )}
                  />
                  <DimensionCalculator />
                </div>

              </div>

              <div>

              </div>
            </div>

            <h2 className="text-lg font-semibold">2. Matérias-Primas</h2>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="primary" className='cursor-pointer'>Principal</TabsTrigger>
                <TabsTrigger value="secondary" className='cursor-pointer'>Secundários</TabsTrigger>
                <TabsTrigger value="extra" className='cursor-pointer'>Extras</TabsTrigger>
              </TabsList>
              <div className="mt-4 max-w-[400px]">
                {activeTab !== 'extra' && (
                  <Input
                    type="text"
                    placeholder={`Buscar em "${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}"...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                )}
              </div>
              <TabsContent value="primary" className="mt-6">
                <FormSection category="primary" items={filteredItems.primary} />
              </TabsContent>
              <TabsContent value="secondary" className="mt-6">
                <FormSection category="secondary" items={filteredItems.secondary} />
              </TabsContent>
              <TabsContent value="extra" className="mt-6">
                <ExtrasTable />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end">
              <Button size="lg" type="button" className='cursor-pointer' onClick={() => setIsModalOpen(true)}>
                Revisar e Calcular Preço
              </Button>
            </div>

            <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} setIsSaving={setIsSaving} />
          </form>
        </FormProvider>
      ) : (
        <div className="text-center p-10 border-2 border-dashed rounded-lg">
          <p className="font-semibold text-muted-foreground">Aguardando arquivo de custos para montar o formulário...</p>
        </div>
      )}

    </>
  );
};