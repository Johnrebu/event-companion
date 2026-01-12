import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalculatorButtonProps {
  onClick: () => void;
}

const CalculatorButton = ({ onClick }: CalculatorButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-40 bg-header-gradient hover:opacity-90 transition-opacity"
      size="icon"
    >
      <Calculator className="h-6 w-6" />
    </Button>
  );
};

export default CalculatorButton;
