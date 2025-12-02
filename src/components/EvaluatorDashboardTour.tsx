import { useEffect, useRef } from 'react';
import {
    hasEvaluatorTourBeenCompleted,
    markEvaluatorTourCompleted,
    getIsFirstLogin,
    isFirstEverLogin
} from '../utils/persistence';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import './EvaluatorDashboardTour.css';

interface User {
    _id?: string;
    name: string;
    username: string;
    role?: 'Administrator' | 'Facilitator' | 'Evaluator';
    is_admin_access?: boolean;
    evaluator_id?: string;
}

interface EvaluatorDashboardTourProps {
    user?: User;
    onComplete?: () => void;
}

export const useEvaluatorDashboardTour = ({ user, onComplete }: EvaluatorDashboardTourProps) => {
    const tourTriggeredRef = useRef(false);

    const startTour = () => {
        const isAdmin = user?.role === 'Administrator';
        const isEvaluator = user?.role === 'Evaluator';

        const driverObj = driver({
            showProgress: true,
            showButtons: ['next', 'previous', 'close'],
            popoverClass: 'driver js-theme',
            steps: [
                {
                    popover: {
                        title: `Welcome to the Evaluator Dashboard! 👋`,
                        description: isEvaluator
                            ? 'This is your personal dashboard where you can view your assigned books and track your evaluation progress. Let\'s take a quick tour!'
                            : 'This dashboard allows you to view all evaluators and their assignment progress. Let\'s explore the key features!'
                    }
                },
                {
                    element: '[data-tour="stats-section"]',
                    popover: {
                        title: '📊 Dashboard Statistics',
                        description: 'Get a quick overview of key metrics including total evaluators, active evaluators, total assignments, and average completion rate. These stats update in real-time.'
                    }
                },
                {
                    element: '[data-tour="search-input"]',
                    popover: {
                        title: '🔍 Search Evaluators',
                        description: 'Quickly find evaluators by searching their name, email, region/division, or area of specialization. The results filter instantly as you type.'
                    }
                },
                {
                    element: '[data-tour="evaluator-card"]',
                    popover: {
                        title: '👤 Evaluator Profile Cards',
                        description: isEvaluator
                            ? 'This is your profile card. Click on it to view your full evaluator dashboard with all assigned books and evaluation tasks.'
                            : 'Each card shows key information about an evaluator including their name, designation, region/division, specialization, and email. Click any card to view detailed assignment progress.'
                    }
                },
                {
                    element: '[data-tour="evaluator-card"]',
                    popover: {
                        title: '📝 Evaluator Details',
                        description: 'When you click on an evaluator card, you\'ll see:\n• Personal information and credentials\n• Book assignments grouped by event\n• Task status for each book\n• Overall completion progress\n• Individual task management'
                    }
                },
                ...(isAdmin ? [{
                    popover: {
                        title: '🔧 Admin Features',
                        description: 'As an administrator, you have access to view all evaluators across all learning areas. You can track progress, monitor completion rates, and identify evaluators who may need support.'
                    }
                }] : []),
                ...(isEvaluator ? [{
                    popover: {
                        title: '✅ Managing Your Tasks',
                        description: 'When you view your detailed dashboard, you can:\n• See all books assigned to you\n• Update task status (Pending, Ongoing, Done)\n• Track which uploads you need to complete\n• Monitor your overall progress\n• View completion percentage per assignment'
                    }
                }] : []),
                {
                    popover: {
                        title: '🎉 You\'re All Set!',
                        description: isEvaluator
                            ? 'You\'re ready to manage your evaluations! Click on your profile card to get started. You can restart this tour anytime from the "Start Tour" option in your profile menu.'
                            : 'You\'re ready to monitor evaluator progress! Click on any evaluator card to view their detailed dashboard. You can restart this tour anytime from the "Start Tour" option in the profile menu.'
                    }
                }
            ],
            onDestroyed: () => {
                const uid = user?._id;
                if (uid) {
                    markEvaluatorTourCompleted(uid);
                }
                if (onComplete) {
                    onComplete();
                }
            }
        });

        driverObj.drive();
    };

    // Auto-start tour only on first ever login for evaluator accounts
    // Tour will NOT auto-start on page refresh or subsequent logins
    useEffect(() => {
        if (!user?._id || tourTriggeredRef.current) return;

        const userId = user._id;
        const tourCompleted = hasEvaluatorTourBeenCompleted(userId);
        const isFirstLogin = getIsFirstLogin();
        const isFirstEver = isFirstEverLogin(userId);

        // Only auto-start evaluator tour if:
        // 1. User is an evaluator (not admin)
        // 2. This is a fresh login (not page refresh)
        // 3. This is the user's first ever login
        // 4. Tour hasn't been completed before
        if (user.role === 'Evaluator' && isFirstLogin && isFirstEver && !tourCompleted) {
            tourTriggeredRef.current = true;
            const timer = setTimeout(() => {
                startTour();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [user]);

    return { startTour };
};

// Standalone component version that can be triggered manually
export const EvaluatorDashboardTour: React.FC<EvaluatorDashboardTourProps> = ({ user, onComplete }) => {
    const { startTour } = useEvaluatorDashboardTour({ user, onComplete });

    // This can be called from a button or menu option
    return null;
};
