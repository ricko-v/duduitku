
import { router } from '@inertiajs/react';
import { Lock, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';

import PinKeypad from '@/components/pin-keypad';
import { Button } from '@/components/ui/button';

interface Props {
    pinEnabled: boolean;
}

export default function ManagePin({ pinEnabled }: Props) {
    const [mode, setMode] = useState<'view' | 'setup' | 'disable'>('view');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [step, setStep] = useState<'enter' | 'confirm'>('enter');
    const [error, setError] = useState('');

    const reset = () => {
        setMode('view');
        setPin('');
        setConfirmPin('');
        setStep('enter');
        setError('');
    };

    const handleSetupPin = (pinValue: string) => {
        if (step === 'enter') {
            setPin(pinValue);
            setStep('confirm');
        } else {
            setConfirmPin(pinValue);

            if (pinValue !== pin) {
                setError('PIN tidak cocok. Coba lagi.');
                setPin('');
                setConfirmPin('');
                setStep('enter');
            } else {
                router.post('/settings/pin', { pin: pinValue }, {
                    onSuccess: () => reset(),
                    onError: (errors) => {
                        setError(errors.pin || 'Gagal mengatur PIN.');
                        reset();
                    },
                });
            }
        }
    };

    const handleDisablePin = (pinValue: string) => {
        router.delete('/settings/pin', {
            data: { pin: pinValue },
            onSuccess: () => reset(),
            onError: (errors) => {
                setError(errors.pin || 'PIN salah.');
                setPin('');
            },
        });
    };

    if (mode === 'setup') {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-foreground">Atur PIN</h3>
                        <p className="text-[10px] text-muted-foreground">
                            {step === 'enter' ? 'Masukkan 6 digit PIN baru' : 'Konfirmasi PIN'}
                        </p>
                    </div>
                    <button onClick={reset} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <PinKeypad
                    value={step === 'enter' ? pin : confirmPin}
                    onChange={step === 'enter' ? setPin : setConfirmPin}
                    onComplete={handleSetupPin}
                />

                {error && <p className="text-sm text-[#f43f5e] text-center">{error}</p>}
            </div>
        );
    }

    if (mode === 'disable') {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-foreground">Nonaktifkan PIN</h3>
                        <p className="text-[10px] text-muted-foreground">Masukkan PIN saat ini untuk menonaktifkan</p>
                    </div>
                    <button onClick={reset} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <PinKeypad
                    value={pin}
                    onChange={setPin}
                    onComplete={handleDisablePin}
                />

                {error && <p className="text-sm text-[#f43f5e] text-center">{error}</p>}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Lock className="h-4 w-4 text-[#f59e0b]" />
                    Login dengan PIN
                </h3>
                <p className="text-[10px] text-muted-foreground mt-1">
                    {pinEnabled
                        ? 'PIN aktif. Kamu bisa login menggunakan PIN 6 digit.'
                        : 'Gunakan PIN 6 digit untuk login yang lebih cepat.'
                    }
                </p>
            </div>

            {pinEnabled ? (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 px-3 py-2">
                        <ShieldCheck className="h-4 w-4 text-[#10b981]" />
                        <span className="text-xs font-semibold text-[#10b981]">PIN Aktif</span>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => {
 setMode('setup'); setStep('confirm'); 
}}
                            className="flex-1 bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30 hover:bg-[#f59e0b]/25 text-[10px] font-bold tracking-wider uppercase h-9 rounded-lg"
                        >
                            Ubah PIN
                        </Button>
                        <Button
                            onClick={() => setMode('disable')}
                            className="flex-1 bg-[#f43f5e]/15 text-[#f43f5e] border border-[#f43f5e]/30 hover:bg-[#f43f5e]/25 text-[10px] font-bold tracking-wider uppercase h-9 rounded-lg"
                        >
                            Nonaktifkan
                        </Button>
                    </div>
                </div>
            ) : (
                <Button
                    onClick={() => setMode('setup')}
                    className="w-full bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30 hover:bg-[#f59e0b]/25 text-[10px] font-bold tracking-wider uppercase h-10 rounded-lg gaming-glow-gold"
                >
                    <Lock className="h-4 w-4 mr-2" />
                    Aktifkan PIN
                </Button>
            )}
        </div>
    );
}
