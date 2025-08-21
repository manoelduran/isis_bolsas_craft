import { CraftForm } from '@/components/CraftForm';
import { CsvUploader } from '@/components/shared/CsvUploader';
import { useRawMaterials } from '@/hooks/useRawMaterials';


export const  CraftPage = () => {
  const { areCostsLoaded } = useRawMaterials();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Isis Bolsas Crafting</h1>
        <p className="text-muted-foreground mt-2">
          Importe seu arquivo de custos para começar a criar.
        </p>
      </header>
      <main>
        <section className="flex justify-center mb-12">
          <CsvUploader />
        </section>

        {areCostsLoaded ? (
          <CraftForm />
        ) : (
          <div className="text-center p-10 border-2 border-dashed rounded-lg">
            <p className="font-semibold text-muted-foreground">Aguardando arquivo de custos para montar o formulário...</p>
          </div>
        )}
      </main>
    </div>
  );
}