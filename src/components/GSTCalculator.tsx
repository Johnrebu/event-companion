import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Calculator } from "lucide-react";

interface GSTCalculatorProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function GSTCalculator({ isOpen, onClose }: GSTCalculatorProps) {
    const [amount, setAmount] = useState<string>("");
    const [gstRate, setGstRate] = useState<string>("18");
    const [taxType, setTaxType] = useState<"exclusive" | "inclusive">("exclusive");

    const [actualAmount, setActualAmount] = useState<number>(0);
    const [gstAmount, setGstAmount] = useState<number>(0);
    const [totalAmount, setTotalAmount] = useState<number>(0);

    useEffect(() => {
        const numAmount = parseFloat(amount) || 0;
        const rate = parseFloat(gstRate);

        if (taxType === "exclusive") {
            const gst = (numAmount * rate) / 100;
            setActualAmount(numAmount);
            setGstAmount(gst);
            setTotalAmount(numAmount + gst);
        } else {
            const baseAmount = (numAmount * 100) / (100 + rate);
            const gst = numAmount - baseAmount;
            setActualAmount(baseAmount);
            setGstAmount(gst);
            setTotalAmount(numAmount);
        }
    }, [amount, gstRate, taxType]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(val);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-primary">
                        <Calculator className="h-6 w-6" />
                        GST Calculator
                    </DialogTitle>
                </DialogHeader>

                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white mb-6">
                    <h3 className="text-xl font-semibold mb-2">Easy GST Calculation</h3>
                    <p className="opacity-90">Calculate GST instantly for your business transactions.</p>
                </div>

                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="text-lg"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="gst-rate">GST %</Label>
                            <Select value={gstRate} onValueChange={setGstRate}>
                                <SelectTrigger id="gst-rate">
                                    <SelectValue placeholder="Select Rate" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">0%</SelectItem>
                                    <SelectItem value="5">5%</SelectItem>
                                    <SelectItem value="12">12%</SelectItem>
                                    <SelectItem value="18">18%</SelectItem>
                                    <SelectItem value="28">28%</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tax-type">Tax Type</Label>
                            <Select value={taxType} onValueChange={(val: "exclusive" | "inclusive") => setTaxType(val)}>
                                <SelectTrigger id="tax-type">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="exclusive">Exclusive</SelectItem>
                                    <SelectItem value="inclusive">Inclusive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="bg-secondary/20 p-6 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
                        <div className="text-center flex-1">
                            <div className="text-3xl font-bold text-primary mb-1">
                                {formatCurrency(actualAmount)}
                            </div>
                            <div className="text-sm text-muted-foreground font-medium">Actual Amount</div>
                        </div>

                        <div className="text-xl font-bold text-muted-foreground">+</div>

                        <div className="text-center flex-1">
                            <div className="text-3xl font-bold text-primary mb-1">
                                {formatCurrency(gstAmount)}
                            </div>
                            <div className="text-sm text-muted-foreground font-medium">GST Amount</div>
                        </div>

                        <div className="text-xl font-bold text-muted-foreground">=</div>

                        <div className="text-center flex-1">
                            <div className="text-3xl font-bold text-primary mb-1">
                                {formatCurrency(totalAmount)}
                            </div>
                            <div className="text-sm text-muted-foreground font-medium">Total Amount</div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
