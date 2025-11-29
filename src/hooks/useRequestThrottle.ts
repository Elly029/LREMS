import { useRef, useCallback } from 'react';

/**
 * Hook to throttle function calls - ensures function is called at most once per interval
 */
export function useRequestThrottle(delay: number = 1000) {
    const lastRun = useRef<number>(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const throttledFunction = useCallback(
        <T extends (...args: any[]) => any>(fn: T) => {
            return (...args: Parameters<T>): void => {
                const now = Date.now();
                const timeSinceLastRun = now - lastRun.current;

                // Clear any pending timeout
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }

                if (timeSinceLastRun >= delay) {
                    // Execute immediately if enough time has passed
                    lastRun.current = now;
                    fn(...args);
                } else {
                    // Schedule execution after remaining time
                    const remainingTime = delay - timeSinceLastRun;
                    timeoutRef.current = setTimeout(() => {
                        lastRun.current = Date.now();
                        fn(...args);
                    }, remainingTime);
                }
            };
        },
        [delay]
    );

    return throttledFunction;
}
