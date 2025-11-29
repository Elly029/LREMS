import { useRef, useCallback } from 'react';

interface RateLimitOptions {
    minInterval?: number; // Minimum time between requests in ms
    maxRetries?: number; // Maximum number of retries on rate limit
    baseDelay?: number; // Base delay for exponential backoff in ms
}

/**
 * Hook to prevent too many API requests with rate limiting and retry logic
 */
export function useRateLimitedFetch(options: RateLimitOptions = {}) {
    const {
        minInterval = 1000, // Default: 1 second between requests
        maxRetries = 3,
        baseDelay = 2000, // Default: 2 seconds base delay
    } = options;

    const lastRequestTime = useRef<number>(0);
    const requestQueue = useRef<Promise<any> | null>(null);
    const retryCount = useRef<number>(0);

    const rateLimitedFetch = useCallback(
        async <T>(fetchFn: () => Promise<T>): Promise<T> => {
            // Wait for any pending request to complete
            if (requestQueue.current) {
                await requestQueue.current;
            }

            // Calculate time since last request
            const now = Date.now();
            const timeSinceLastRequest = now - lastRequestTime.current;
            const delayNeeded = Math.max(0, minInterval - timeSinceLastRequest);

            // Wait if necessary to respect rate limit
            if (delayNeeded > 0) {
                await new Promise(resolve => setTimeout(resolve, delayNeeded));
            }

            lastRequestTime.current = Date.now();

            // Execute the fetch with retry logic
            const executeWithRetry = async (): Promise<T> => {
                try {
                    const promise = fetchFn();
                    requestQueue.current = promise;
                    const result = await promise;
                    retryCount.current = 0; // Reset on success
                    return result;
                } catch (error: any) {
                    // Check if it's a rate limit error
                    const isRateLimitError =
                        error?.status === 429 ||
                        error?.message?.toLowerCase().includes('too many requests') ||
                        error?.code === 'RATE_LIMIT_EXCEEDED';

                    if (isRateLimitError && retryCount.current < maxRetries) {
                        retryCount.current++;
                        const delay = baseDelay * Math.pow(2, retryCount.current - 1);

                        console.warn(
                            `Rate limit hit. Retrying in ${delay}ms... (Attempt ${retryCount.current}/${maxRetries})`
                        );

                        await new Promise(resolve => setTimeout(resolve, delay));
                        return executeWithRetry();
                    }

                    // Reset retry count and throw error
                    retryCount.current = 0;
                    throw error;
                } finally {
                    requestQueue.current = null;
                }
            };

            return executeWithRetry();
        },
        [minInterval, maxRetries, baseDelay]
    );

    const reset = useCallback(() => {
        lastRequestTime.current = 0;
        retryCount.current = 0;
        requestQueue.current = null;
    }, []);

    return { rateLimitedFetch, reset };
}
