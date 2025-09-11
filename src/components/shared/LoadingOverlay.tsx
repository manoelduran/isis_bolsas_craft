import Lottie from "lottie-react";
import loadingAnimation from "@/assets/animations/loading.json";


interface Props {
  isLoading: boolean;
}

export const LoadingOverlay = ({ isLoading }: Props) => {
  if (!isLoading) {
    return null;
  }

  return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
          <Lottie 
          animationData={loadingAnimation} 
          loop={true} 
          style={{ width: 150, height: 150 }} 
        />
        <p className="text-center mt-4 font-semibold text-gray-600">Salvando no Drive...</p>
   </div>
  );
};