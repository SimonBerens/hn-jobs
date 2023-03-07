import {useEffect, useState} from "react";

export function useLoadingText() {
    const [loadingText, setLoadingText] = useState('Loading comments...');

    useEffect(() => {
        const interval = setInterval(() => {
        setLoadingText((text) => {
            if (text.endsWith('...')) {
            return text.slice(0, -3);
            }
            return text + '.';
        });
        }, 300);
        return () => clearInterval(interval);
    }, []);

    return loadingText;
}