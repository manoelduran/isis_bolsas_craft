import { GoogleOAuthProvider } from "@react-oauth/google";
import { TooltipProvider } from "./components/ui/tooltip";
import { RawMaterialProvider } from "./context/RawMaterialContext";
import { CraftPage } from "./pages/Craft";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";


function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID as string}>
      <AuthProvider>
        <RawMaterialProvider>
          <TooltipProvider>
            <Toaster richColors position="top-right" />
            <CraftPage />
          </TooltipProvider>
        </RawMaterialProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export default App;