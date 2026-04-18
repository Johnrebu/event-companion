import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalculatorButtonProps {
  onClick: () => void;
}

const CalculatorButton = ({ onClick }: CalculatorButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-4 right-4 z-40 h-12 w-12 rounded-full bg-header-gradient shadow-lg transition-opacity hover:opacity-90 sm:h-14 sm:w-14"
      size="icon"
    >
      <Calculator className="h-6 w-6" />
    </Button>
  );
};

export default CalculatorButton;
