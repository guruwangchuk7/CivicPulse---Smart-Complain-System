'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg border border-white/20 text-gray-700">
                <Sun className="w-6 h-6" />
            </button>
        );
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="bg-white/90 dark:bg-black/90 backdrop-blur-md p-3 rounded-full shadow-lg hover:scale-105 transition-all border border-white/20 dark:border-gray-800 text-gray-700 dark:text-yellow-400"
            aria-label="Toggle Theme"
        >
            {theme === 'dark' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
        </button>
    );
}
