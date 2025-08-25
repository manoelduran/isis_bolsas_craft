import { useState, useMemo } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BagStyleSelect, BagStyle } from './BagStyleSelect';
import { FormSection } from './FormSection';
import { ConfirmationModal } from './ConfirmationModal';
import { DimensionInput } from './DimensionInput';
import type { BagForm } from '@/types';

export const CraftForm = () => {
  const { materialsState } = useRawMaterials();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const methods = useForm<BagForm>({
    defaultValues: {
      style: BagStyle.Tote,
      dimensions: '',
      profit_percentage: 0,
      taxes: 0,
    }
  });

  const [activeTab, setActiveTab] = useState('primary'); 
  const [searchTerm, setSearchTerm] = useState('');
  const filteredItems = useMemo(() => {
    if (!searchTerm) return materialsState;
    const lowercasedFilter = searchTerm.toLowerCase();
    const activeCategoryItems = materialsState[activeTab as keyof typeof materialsState];
    const filtered = Object.entries(activeCategoryItems)
      .filter(([, itemData]) => itemData.name.toLowerCase().includes(lowercasedFilter));
    return { ...materialsState, [activeTab]: Object.fromEntries(filtered) };
  }, [searchTerm, materialsState, activeTab]);

  return (
    <>
     <FormProvider {...methods}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <BagStyleSelect />
            </div>
            <div>
              <label htmlFor="dimensions" className="text-sm font-medium">Dimensões (cm)</label>
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
            <div className="mt-4 w-[300px]">
              <Input type="text" placeholder={`Buscar em "${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}"...`}
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
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
    </>
  );
};