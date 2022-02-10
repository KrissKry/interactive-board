import { useEffect } from 'react';

export const useKeyboardEvent = (key: string, callback: () => void) : void => {
    useEffect(() => {
        const handler = (event : KeyboardEvent) => {
            if (event.key === key) {
                callback();
            }
        };

        window.addEventListener('keydown', handler);
        return () => {
            window.removeEventListener('keydown', handler);
        };
    }, []);
};
