import { useEffect } from 'react';
import { nsKey } from '../utils/persistence';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import './EvaluatorDashboardTour.css';

interface User {
    name: string;
    username: string;
    is_admin_access?: boolean;
    evaluator_id?: string;
}

interface EvaluatorDashboardTourProps {
    user?: User;
    onComplete?: () => void;
}

export const useEvaluatorDashboardTour = ({ user, onComplete }: EvaluatorDashboardTourProps) => {
    const startTour = () => {
        const isAdmin = user?.is_admin_access;
        const isEvaluator = user?.evaluator_id && !isAdmin;

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
                const keyUserId = user?.username ? undefined : undefined;
                const uid = (user as any)?._id as string | undefined;
                if (uid) {
                    localStorage.setItem(nsKey(uid, 'evaluatorDashboardTourCompleted'), 'true');
                } else {
                    localStorage.setItem('evaluatorDashboardTourCompleted', 'true');
                }
                if (onComplete) {
                    onComplete();
                }
            }
        });

        driverObj.drive();
    };

    useEffect(() => {
        // Check if tour has been completed before
        const uid = (user as any)?._id as string | undefined;
        const tourCompleted = uid ? localStorage.getItem(nsKey(uid, 'evaluatorDashboardTourCompleted')) : localStorage.getItem('evaluatorDashboardTourCompleted');

        // Auto-start tour if not completed (optional - can be disabled)
        // if (!tourCompleted) {
        //     setTimeout(startTour, 500);
        // }
    }, []);

    return { startTour };
};

// Standalone component version that can be triggered manually
export const EvaluatorDashboardTour: React.FC<EvaluatorDashboardTourProps> = ({ user, onComplete }) => {
    const { startTour } = useEvaluatorDashboardTour({ user, onComplete });

    // This can be called from a button or menu option
    return null;
};
