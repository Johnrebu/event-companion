import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
    QrCode,
    Camera,
    CheckCircle2,
    AlertCircle,
    Search,
    UserCheck,
    Volume2,
    X,
    Users,
    Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { AscendAttendee } from '@/types/ascend';
import { toast } from 'sonner';

interface QRScannerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCheckInCode: (codeOrPayload: string) => { success: boolean; attendee?: AscendAttendee; message: string };
    onViewPass: (attendee: AscendAttendee) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
    open,
    onOpenChange,
    onCheckInCode,
    onViewPass,
}) => {
    const [manualCode, setManualCode] = useState('');
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [lastCheckedAttendee, setLastCheckedAttendee] = useState<AscendAttendee | null>(null);
    const [lastScanMessage, setLastScanMessage] = useState<{ text: string; isSuccess: boolean } | null>(null);
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const scannerRegionId = 'ascend-qr-scanner-region';

    // Play subtle audio beep on check-in
    const playSuccessBeep = () => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } catch (e) {
            // Audio context not available or blocked
        }
    };

    const handleProcessCode = (code: string) => {
        if (!code.trim()) return;
        const result = onCheckInCode(code);
        if (result.success && result.attendee) {
            playSuccessBeep();
            setLastCheckedAttendee(result.attendee);
            setLastScanMessage({ text: result.message, isSuccess: true });
            toast.success(result.message);
        } else {
            setLastScanMessage({ text: result.message, isSuccess: false });
            toast.error(result.message);
        }
        setManualCode('');
    };

    const startCamera = async () => {
        setCameraError(null);
        setIsCameraActive(true);
        try {
            if (!html5QrCodeRef.current) {
                html5QrCodeRef.current = new Html5Qrcode(scannerRegionId, {
                    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                    verbose: false,
                });
            }

            await html5QrCodeRef.current.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 220, height: 220 },
                },
                (decodedText) => {
                    handleProcessCode(decodedText);
                },
                () => {
                    // Ignore frame scanning misses
                }
            );
        } catch (err: any) {
            console.error('Camera start failed:', err);
            setCameraError(err.message || 'Unable to access camera. Please check browser permissions.');
            setIsCameraActive(false);
        }
    };

    const stopCamera = async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            try {
                await html5QrCodeRef.current.stop();
            } catch (err) {
                console.error('Camera stop failed:', err);
            }
        }
        setIsCameraActive(false);
    };

    useEffect(() => {
        if (!open) {
            stopCamera();
            setLastCheckedAttendee(null);
            setLastScanMessage(null);
        }
    }, [open]);

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleProcessCode(manualCode);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-[#0B0F19] border-slate-800 text-white rounded-2xl sm:rounded-3xl p-6 shadow-2xl">
                <DialogHeader className="border-b border-slate-800 pb-3">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <QrCode className="h-5 w-5 text-amber-400" />
                        Gate Check-in Scanner
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-400">
                        Scan attendee pass QR code using device camera or enter Client Code / Mobile.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    {/* Camera Scanner Box */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden relative min-h-[220px] flex flex-col items-center justify-center p-3">
                        <div id={scannerRegionId} className="w-full max-w-[260px] rounded-xl overflow-hidden" />

                        {!isCameraActive && (
                            <div className="text-center space-y-3 p-4">
                                <div className="h-12 w-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-amber-400">
                                    <Camera className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Live Camera QR Scanner</p>
                                    <p className="text-xs text-slate-500">Scan digital phone screen or printed pass</p>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={startCamera}
                                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs gap-1.5"
                                >
                                    <Camera className="h-3.5 w-3.5" />
                                    Launch Camera Scanner
                                </Button>
                            </div>
                        )}

                        {isCameraActive && (
                            <div className="w-full flex justify-center pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={stopCamera}
                                    className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs h-7"
                                >
                                    Pause Camera
                                </Button>
                            </div>
                        )}

                        {cameraError && (
                            <div className="p-3 mt-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{cameraError}</span>
                            </div>
                        )}
                    </div>

                    {/* Manual Rapid Code Entry */}
                    <form onSubmit={handleManualSubmit} className="space-y-2">
                        <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                            <span>Manual Code / Mobile Search:</span>
                            <span className="text-[10px] text-slate-500 font-mono">e.g. K000773 or 9840123456</span>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder="Enter Client Code or Phone..."
                                    value={manualCode}
                                    onChange={(e) => setManualCode(e.target.value)}
                                    className="pl-9 bg-slate-950 border-slate-800 text-white font-mono text-sm placeholder:text-slate-600 focus:border-amber-500"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4"
                            >
                                Check In
                            </Button>
                        </div>
                    </form>

                    {/* Live Result Banner */}
                    {lastScanMessage && (
                        <div
                            className={`p-4 rounded-xl border flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-200 ${
                                lastScanMessage.isSuccess
                                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                            }`}
                        >
                            <div className="flex items-center gap-2 text-xs font-bold">
                                {lastScanMessage.isSuccess ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 text-rose-400" />
                                )}
                                <span>{lastScanMessage.text}</span>
                            </div>

                            {lastCheckedAttendee && (
                                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-white text-xs space-y-1.5">
                                    <div className="flex items-center justify-between font-bold">
                                        <span>{lastCheckedAttendee.clientName}</span>
                                        <span className="font-mono text-amber-400">{lastCheckedAttendee.clientCode}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3 w-3 text-slate-400" />
                                            {lastCheckedAttendee.numberOfAttendees} {lastCheckedAttendee.numberOfAttendees === 2 ? 'Persons' : 'Person'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3 text-slate-400" />
                                            {lastCheckedAttendee.session}
                                        </span>
                                    </div>
                                    {lastCheckedAttendee.hasAccompanyingGuest && (
                                        <p className="text-[11px] text-slate-300 border-t border-slate-800 pt-1">
                                            Guest: <span className="font-semibold">{lastCheckedAttendee.accompanyingGuestName}</span>
                                        </p>
                                    )}
                                    <div className="pt-2 flex justify-end">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => onViewPass(lastCheckedAttendee)}
                                            className="h-7 text-[11px] bg-slate-800 hover:bg-slate-700 text-white"
                                        >
                                            View Pass
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
