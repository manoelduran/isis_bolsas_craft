import { TooltipProvider } from "./components/ui/tooltip";
import { RawMaterialProvider } from "./context/RawMaterialContext";
import { CraftPage } from "./pages/Craft";


function App() {
  return (
    <RawMaterialProvider>
      <TooltipProvider>
      <CraftPage />
      </TooltipProvider>
    </RawMaterialProvider>
  )
}

export default App;