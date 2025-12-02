import { useEffect, useRef } from 'react';
import { apiClient } from '../services/api';
import { User } from '../types';

interface UseSessionValidationProps {
    user: User | null;
    onSessionInvalid: () => void;
    validationInterval?: number; // in milliseconds, default 5 minutes
}

/**
 * Hook to periodically validate user session
 * Checks if access rules have changed on the server
 * Automatically logs out user if their access rules version doesn't match
 */
export const useSessionValidation = ({
    user,
    onSessionInvalid,
    validationInterval = 5 * 60 * 1000, // 5 minutes default
}: UseSessionValidationProps) => {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isValidatingRef = useRef(false);

    const validateSession = async () => {
        if (!user || isValidatingRef.current) return;

        isValidatingRef.current = true;

        try {
            const response = await apiClient.post<{
                valid: boolean;
                reason?: string;
                message?: string;
                current_version?: number;
            }>('/auth/validate', {
                access_rules_version: user.access_rules_version || 1,
            });

            if (!response.valid) {
                console.log(`Session invalidated: ${response.reason} - ${response.message}`);

                // Show user-friendly message
                if (response.reason === 'access_rules_changed') {
                    alert(
                        'Your access permissions have been updated.\n\n' +
                        'You will be logged out and need to log in again to see your updated access.'
                    );
                }

                // Trigger logout
                onSessionInvalid();
            }
        } catch (error: any) {
            // If validation fails due to auth error (401), also logout
            if (error.status === 401) {
                console.log('Session expired or invalid token');
                onSessionInvalid();
            } else {
                // For other errors, just log them (don't logout on network errors)
                console.warn('Session validation failed:', error.message);
            }
        } finally {
            isValidatingRef.current = false;
        }
    };

    useEffect(() => {
        if (!user) {
            // Clear interval if user logs out
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Validate immediately on mount
        validateSession();

        // Set up periodic validation
        intervalRef.current = setInterval(validateSession, validationInterval);

        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [user, validationInterval]);

    return {
        validateNow: validateSession,
    };
};
