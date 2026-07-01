import { Delete } from 'lucide-react';
import { useCallback, useEffect } from 'react';

interface PinKeypadProps {
    value: string;
    onChange: (value: string) => void;
    length?: number;
    disabled?: boolean;
    onComplete?: (pin: string) => void;
}

export default function PinKeypad({ value, onChange, length = 6, disabled = false, onComplete }: PinKeypadProps) {
    const handleKey = useCallback((key: string) => {
        if (disabled) {
return;
}

        if (value.length < length) {
            const next = value + key;
            onChange(next);

            if (next.length === length && onComplete) {
                onComplete(next);
            }
        }
    }, [value, length, disabled, onChange, onComplete]);

    const handleDelete = useCallback(() => {
        if (disabled) {
return;
}

        onChange(value.slice(0, -1));
    }, [value, disabled, onChange]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (disabled) {
return;
}

            if (e.key >= '0' && e.key <= '9') {
                handleKey(e.key);
            } else if (e.key === 'Backspace') {
                handleDelete();
            }
        };
        window.addEventListener('keydown', handler);

        return () => window.removeEventListener('keydown', handler);
    }, [disabled, handleKey, handleDelete]);

    const dots = Array.from({ length }, (_, i) => (
        <div
            key={i}
            className={`h-3.5 w-3.5 rounded-full transition-all duration-200 ${
                i < value.length
                    ? 'bg-primary shadow-[0_0_8px_rgba(245,158,11,0.4)] scale-110'
                    : 'bg-border'
            }`}
        />
    ));

    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

    return (
        <div className="flex flex-col items-center gap-6">
            {/* PIN Dots */}
            <div className="flex items-center gap-3">
                {dots}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-[240px]">
                {keys.map((key) => {
                    if (key === '') {
                        return <div key="empty" />;
                    }

                    if (key === 'del') {
                        return (
                            <button
                                key="del"
                                type="button"
                                onClick={handleDelete}
                                disabled={disabled || value.length === 0}
                                className="flex h-14 w-14 mx-auto items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-30"
                            >
                                <Delete className="h-5 w-5" />
                            </button>
                        );
                    }

                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => handleKey(key)}
                            disabled={disabled || value.length >= length}
                            className="flex h-14 w-14 mx-auto items-center justify-center rounded-xl bg-card border border-border text-xl font-bold text-foreground hover:bg-muted hover:border-primary/30 hover:text-primary active:scale-95 transition-all disabled:opacity-30"
                        >
                            {key}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
