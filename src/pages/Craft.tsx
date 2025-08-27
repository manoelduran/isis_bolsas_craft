import { CraftForm } from '@/components/CraftForm';


export const  CraftPage = () => {

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Isis Bolsas Crafting</h1>
        <p className="text-muted-foreground mt-2">
          Importe seu arquivo de custos para começar a criar.
        </p>
      </header>
      <main>
          <CraftForm />
      </main>
    </div>
  );
}