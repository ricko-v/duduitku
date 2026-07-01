import { Form, Head } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import PinKeypad from '@/components/pin-keypad';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

function getCsrfToken(): string {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

function apiPost(url: string, body: Record<string, unknown>) {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getCsrfToken(),
        },
        credentials: 'same-origin',
        body: JSON.stringify(body),
    });
}

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const [step, setStep] = useState<'email' | 'pin' | 'password'>('email');
    const [email, setEmail] = useState('');
    const [pin, setPin] = useState('');
    const [remember, setRemember] = useState(false);
    const [pinError, setPinError] = useState('');
    const [loading, setLoading] = useState(false);

    const checkEmail = useCallback(async () => {
        if (!email.trim()) {
return;
}

        setLoading(true);
        setPinError('');

        try {
            const res = await apiPost('/auth/pin/check', { email });
            const data = await res.json();

            if (res.ok && data.pin_enabled) {
                setStep('pin');
            } else {
                setStep('password');
            }
        } catch {
            setStep('password');
        } finally {
            setLoading(false);
        }
    }, [email]);

    const handlePinComplete = useCallback(async (pinValue: string) => {
        setLoading(true);
        setPinError('');

        try {
            const res = await apiPost('/auth/pin/login', { email, pin: pinValue, remember });
            const data = await res.json();

            if (res.ok && data.success) {
                window.location.href = data.redirect || '/dashboard';
            } else {
                setPinError(data.errors?.pin || data.message || 'PIN salah.');
                setPin('');
            }
        } catch {
            setPinError('Terjadi kesalahan.');
            setPin('');
        } finally {
            setLoading(false);
        }
    }, [email, remember]);

    return (
        <>
            <Head title="Masuk" />

            <PasskeyVerify />

            {step === 'email' && (
                <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Alamat Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                            autoComplete="email"
                            placeholder="email@example.com"
                            onKeyDown={(e: React.KeyboardEvent) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    checkEmail();
                                }
                            }}
                        />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            checked={remember}
                            onCheckedChange={(v) => setRemember(v as boolean)}
                        />
                        <Label htmlFor="remember">Ingat saya</Label>
                    </div>

                    <Button
                        onClick={checkEmail}
                        className="w-full"
                        disabled={loading || !email.trim()}
                    >
                        {loading && <Spinner />}
                        Lanjutkan
                    </Button>
                </div>
            )}

            {step === 'pin' && (
                <div className="flex flex-col items-center gap-6">
                    <div className="text-center">
                        <p className="text-sm text-sidebar-foreground">Masukkan PIN untuk</p>
                        <p className="text-sm font-semibold text-foreground">{email}</p>
                    </div>

                    <PinKeypad
                        value={pin}
                        onChange={setPin}
                        disabled={loading}
                        onComplete={handlePinComplete}
                    />

                    {pinError && (
                        <p className="text-sm text-destructive text-center">{pinError}</p>
                    )}

                    {loading && (
                        <div className="flex items-center gap-2 text-xs text-primary">
                            <Spinner />
                            <span>Memverifikasi...</span>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => {
 setStep('email'); setPin(''); setPinError(''); 
}}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Ganti email
                    </button>
                </div>
            )}

            {step === 'password' && (
                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Alamat Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        defaultValue={email}
                                        required
                                        autoComplete="email"
                                        placeholder="email@example.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Password</Label>
                                        {canResetPassword && (
                                            <TextLink
                                                href={request()}
                                                className="ml-auto text-sm"
                                            >
                                                Lupa password?
                                            </TextLink>
                                        )}
                                    </div>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        autoComplete="current-password"
                                        placeholder="Password"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                    />
                                    <Label htmlFor="remember">Ingat saya</Label>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={processing}
                                >
                                    {processing && <Spinner />}
                                    Masuk
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            )}

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Masuk ke akunmu',
    description: 'Masukkan email dan PIN atau password untuk masuk',
};
