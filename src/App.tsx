import { GoogleOAuthProvider } from "@react-oauth/google";
import { TooltipProvider } from "./components/ui/tooltip";
import { RawMaterialProvider } from "./context/RawMaterialContext";
import { CraftPage } from "./pages/Craft";
import { AuthProvider } from "./context/AuthContext";


function App() {
  return (
     <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID as string}>
    <AuthProvider>
      <RawMaterialProvider>
      <TooltipProvider>
      <CraftPage />
      </TooltipProvider>
    </RawMaterialProvider>
    </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export default App;