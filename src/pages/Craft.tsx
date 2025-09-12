import { CraftForm } from '@/components/CraftForm';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export const CraftPage = () => {
   const { accessToken, login, logout } = useAuth();
     const [isSaving, setIsSaving] = useState(false);
  if(isSaving){
    return <LoadingOverlay isLoading={isSaving} />
  }
  return (
    <div className="container mx-auto p-4 md:p-8">
      {accessToken ? (
        <div>
          <header className="flex items-center justify-between mb-8 w-full">
            <div className="text-left">
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight">Isis Bolsas Crafting</h1>
            </div>
            <div className="text-right ">
              <Button onClick={logout} variant="outline" className='cursor-pointer'>Sair do Google</Button>
            </div>
          </header>
          <main>
            <p className="text-center text-muted-foreground mb-12">
              Importe um template de custos para começar ou um craft salvo para editar.
            </p>
            <CraftForm setIsSaving={setIsSaving} />
          </main>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
          <h1 className="text-4xl font-bold tracking-tight">Bem-vindo ao Isis Bolsas Crafting</h1>
          <p className="text-muted-foreground mt-4 max-w-md">
            Para criar, editar e salvar suas bolsas diretamente no Google Drive,
            por favor, faça o login com sua conta Google.
          </p>
          <Button onClick={() => login()} size="lg" className="mt-8 cursor-pointer">
            Login com Google
          </Button>
        </div>
      )}
    </div>
  );
};