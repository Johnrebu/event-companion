import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calculator as CalcIcon, X } from "lucide-react";

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const Calculator = ({ isOpen, onClose }: CalculatorProps) => {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  if (!isOpen) return null;

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue;
      let newValue = 0;

      switch (operation) {
        case "+":
          newValue = currentValue + inputValue;
          break;
        case "-":
          newValue = currentValue - inputValue;
          break;
        case "×":
          newValue = currentValue * inputValue;
          break;
        case "÷":
          newValue = currentValue / inputValue;
          break;
        case "%":
          newValue = currentValue % inputValue;
          break;
        default:
          newValue = inputValue;
      }

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = () => {
    if (!operation || previousValue === null) return;

    const inputValue = parseFloat(display);
    let newValue = 0;

    switch (operation) {
      case "+":
        newValue = previousValue + inputValue;
        break;
      case "-":
        newValue = previousValue - inputValue;
        break;
      case "×":
        newValue = previousValue * inputValue;
        break;
      case "÷":
        newValue = previousValue / inputValue;
        break;
      case "%":
        newValue = previousValue % inputValue;
        break;
      default:
        newValue = inputValue;
    }

    setDisplay(String(newValue));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  };

  const buttonClass = "h-11 w-full rounded-lg text-base font-medium transition-all active:scale-95 sm:h-12 sm:w-12 sm:text-lg";

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in slide-in-from-bottom-4 sm:left-auto sm:right-4 sm:max-w-none">
      <div className="bg-header-gradient p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary-foreground">
          <CalcIcon className="h-5 w-5" />
          <span className="font-semibold">Calculator</span>
        </div>
        <button
          onClick={onClose}
          className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4">
        <div className="bg-secondary rounded-lg p-4 mb-4 text-right">
          <div className="truncate text-2xl font-bold text-foreground sm:text-3xl">
            {display}
          </div>
          {operation && previousValue !== null && (
            <div className="text-sm text-muted-foreground">
              {previousValue} {operation}
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="secondary"
            className={buttonClass}
            onClick={clear}
          >
            C
          </Button>
          <Button
            variant="secondary"
            className={buttonClass}
            onClick={() => performOperation("%")}
          >
            %
          </Button>
          <Button
            variant="secondary"
            className={buttonClass}
            onClick={() => setDisplay(String(-parseFloat(display)))}
          >
            ±
          </Button>
          <Button
            variant="default"
            className={buttonClass}
            onClick={() => performOperation("÷")}
          >
            ÷
          </Button>

          {["7", "8", "9"].map((digit) => (
            <Button
              key={digit}
              variant="outline"
              className={buttonClass}
              onClick={() => inputDigit(digit)}
            >
              {digit}
            </Button>
          ))}
          <Button
            variant="default"
            className={buttonClass}
            onClick={() => performOperation("×")}
          >
            ×
          </Button>

          {["4", "5", "6"].map((digit) => (
            <Button
              key={digit}
              variant="outline"
              className={buttonClass}
              onClick={() => inputDigit(digit)}
            >
              {digit}
            </Button>
          ))}
          <Button
            variant="default"
            className={buttonClass}
            onClick={() => performOperation("-")}
          >
            −
          </Button>

          {["1", "2", "3"].map((digit) => (
            <Button
              key={digit}
              variant="outline"
              className={buttonClass}
              onClick={() => inputDigit(digit)}
            >
              {digit}
            </Button>
          ))}
          <Button
            variant="default"
            className={buttonClass}
            onClick={() => performOperation("+")}
          >
            +
          </Button>

          <Button
            variant="outline"
            className={`${buttonClass} col-span-2`}
            onClick={() => inputDigit("0")}
          >
            0
          </Button>
          <Button
            variant="outline"
            className={buttonClass}
            onClick={inputDecimal}
          >
            .
          </Button>
          <Button
            variant="default"
            className={buttonClass}
            onClick={calculate}
          >
            =
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
