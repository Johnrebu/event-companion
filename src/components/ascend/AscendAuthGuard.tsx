import React, { useState } from 'react';
import {
    ShieldCheck,
    Lock,
    Mail,
    KeyRound,
    Eye,
    EyeOff,
    AlertCircle,
    LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAscendAuth } from '@/hooks/useAscendAuth';
import { toast } from 'sonner';

interface AscendAuthGuardProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export const AscendAuthGuard: React.FC<AscendAuthGuardProps> = ({
    children,
    title = "Client Register & Gate Console",
    description = "Restricted Access: Contains confidential client records, contact details, and attendance logs.",
}) => {
    const { user, isAuthenticated, isLoading, login, logout } = useAscendAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        setIsSubmitting(true);

        try {
            const res = await login(email, password);
            if (res.success) {
                toast.success(res.message);
            } else {
                setErrorMessage(res.message);
                toast.error(res.message);
            }
        } catch (err: any) {
            setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center space-y-3 text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
                <p className="text-sm font-semibold text-slate-400">Verifying security credentials...</p>
            </div>
        );
    }

    // IF AUTHENTICATED: Show authenticated user banner + protected children
    if (isAuthenticated && user) {
        return (
            <div className="space-y-4">
                {/* Security Access Strip */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 px-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 backdrop-blur-md">
                    <div className="flex items-center gap-2.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-slate-400">Authenticated Session:</span>
                        <span className="font-semibold text-white">{user.name || user.email}</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold uppercase">
                            {user.role}
                        </span>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={logout}
                        className="h-7 text-xs text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 gap-1.5"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                    </Button>
                </div>

                {children}
            </div>
        );
    }

    // IF NOT AUTHENTICATED: Show clean, secure corporate login screen without any credentials displayed
    return (
        <div className="max-w-md mx-auto py-8 sm:py-14 space-y-6">
            <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-950 via-slate-900 to-[#0B0F19] p-7 sm:p-9 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                {/* Brand Header */}
                <div className="text-center space-y-3 pb-6 border-b border-slate-800 relative">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto shadow-inner">
                        <Lock className="h-7 w-7" />
                    </div>

                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Restricted Organizer Access
                        </div>
                        <h2 className="text-2xl font-black text-white">
                            {title}
                        </h2>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                        {description}
                    </p>
                </div>

                {/* Sign-in Form */}
                <form onSubmit={handleLogin} className="space-y-4 pt-6">
                    {/* Email Input */}
                    <div className="space-y-1.5">
                        <Label htmlFor="auth-email" className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                            Authorized Email ID <span className="text-rose-400">*</span>
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                            <Input
                                id="auth-email"
                                type="email"
                                placeholder="Enter authorized email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 bg-slate-950/90 border-slate-800 text-white placeholder:text-slate-600 focus:border-amber-500 h-11 text-sm rounded-xl"
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                        <Label htmlFor="auth-password" className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                            Password <span className="text-rose-400">*</span>
                        </Label>
                        <div className="relative">
                            <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                            <Input
                                id="auth-password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 pr-10 bg-slate-950/90 border-slate-800 text-white placeholder:text-slate-600 focus:border-amber-500 h-11 text-sm rounded-xl"
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Error Banner */}
                    {errorMessage && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01]"
                    >
                        {isSubmitting ? "Authenticating..." : "Sign In to Access →"}
                    </Button>
                </form>
            </div>
        </div>
    );
};
