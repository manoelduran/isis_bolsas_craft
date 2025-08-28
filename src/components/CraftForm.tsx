import { useState, useMemo } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormSection } from './FormSection';
import { ConfirmationModal } from './ConfirmationModal';
import { CsvUploader } from './shared/CsvUploader';
import { DimensionInput } from './DimensionInput';
import type { BagForm, MaterialsState } from '@/types';
import { generateCraftCsv } from '@/lib/csvGenerator';

export const CraftForm = () => {
  const { materialsState, areCostsLoaded, updateMaterialCosts } = useRawMaterials();
  const [isModalOpen, setIsModalOpen] = useState(false);


  const methods = useForm<BagForm>({
    defaultValues: {
      style: '',
      dimensions: '',
      bag_quantity: '1',
      profit_percentage: 0,
      taxes: 0,
      created_at: new Date(),

    }
  });

  const handleFullCraftLoad = (parsedData: Partial<BagForm>) => {
    methods.reset(parsedData);
    console.log("Formulário populado com dados de craft para edição.", parsedData);
  };
  const handleCostListLoad = (costs: { id: string; cost: number; unit?: string }[]) => {
    updateMaterialCosts(costs);
    console.log("Custos dos materiais atualizados para novo craft.");
  };


  const onFinalSubmit = (data: BagForm) => {

    generateCraftCsv(data, materialsState);
    setIsModalOpen(false);
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
      {areCostsLoaded ? (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onFinalSubmit)} className="space-y-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div>
                <Label htmlFor="style">Nome da Bolsa</Label>
                <Controller
                  name="style"
                  control={methods.control}
                  render={({ field }) => (
                    <Input {...field} id="style" type="text" placeholder="Ex: Bolsa Tote de Couro" className="mt-2" />
                  )}
                />
              </div>
              <div>
                <Label>Dimensões (cm)</Label>
                <Controller
                  name="dimensions"
                  control={methods.control}
                  render={({ field }) => (
                    <DimensionInput {...field} className="mt-2" />
                  )}
                />
              </div>
            </div>

            <h2 className="text-lg font-semibold">2. Matérias-Primas</h2>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="primary">Principal</TabsTrigger>
                <TabsTrigger value="secondary">Secundários</TabsTrigger>
                <TabsTrigger value="extra">Extras</TabsTrigger>
              </TabsList>
              <div className="mt-4">
                <Input
                  type="text"
                  placeholder={`Buscar em "${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}"...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <TabsContent value="primary" className="mt-6">
                <FormSection category="primary" items={filteredItems.primary} />
              </TabsContent>
              <TabsContent value="secondary" className="mt-6">
                <FormSection category="secondary" items={filteredItems.secondary} />
              </TabsContent>
              <TabsContent value="extra" className="mt-6">
                <FormSection category="extra" items={filteredItems.extra} />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end">
              <Button size="lg" type="button" onClick={() => setIsModalOpen(true)}>
                Revisar e Calcular Preço
              </Button>
            </div>

            <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
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