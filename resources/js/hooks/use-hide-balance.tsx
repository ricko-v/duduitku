import { createContext, useContext, useState, useEffect, useCallback  } from 'react';
import type {ReactNode} from 'react';

interface HideBalanceContextType {
    hidden: boolean;
    toggle: () => void;
}

const HideBalanceContext = createContext<HideBalanceContextType>({
    hidden: false,
    toggle: () => {},
});

const STORAGE_KEY = 'duduitku-hide-balance';

export function HideBalanceProvider({ children }: { children: ReactNode }) {
    const [hidden, setHidden] = useState(() => {
        try {
            return localStorage.getItem(STORAGE_KEY) === 'true';
        } catch {
            return false;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, String(hidden));
        } catch {
            // ignore
        }
    }, [hidden]);

    const toggle = useCallback(() => setHidden((h) => !h), []);

    return (
        <HideBalanceContext.Provider value={{ hidden, toggle }}>
            {children}
        </HideBalanceContext.Provider>
    );
}

export function useHideBalance() {
    return useContext(HideBalanceContext);
}
