import { RawMaterialProvider } from "./context/RawMaterialContext";
import { CraftPage } from "./pages/Craft";


function App() {
  return (
    <RawMaterialProvider>
      <CraftPage />
    </RawMaterialProvider>
  )
}

export default App;