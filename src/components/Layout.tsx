import React, { useState, useRef, useEffect } from 'react';
import logo from '../assets/logo.png';
import { TourGuide } from './TourGuide';
import { SkipNavLink } from './SkipNavLink';
import { 
    hasTourBeenCompleted, 
    markTourCompleted, 
    getIsFirstLogin,
    isFirstEverLogin,
    markFirstLoginCompleted
} from '../utils/persistence';

interface LayoutProps {
    children: React.ReactNode;
    user?: { _id: string; name: string; username: string; is_admin_access?: boolean; evaluator_id?: string };
    onLogout?: () => void;
    onChangePassword?: () => void;
    onEditProfile?: () => void;
    currentView: 'inventory' | 'monitoring' | 'admin' | 'create-evaluation' | 'evaluators' | 'evaluator-dashboard' | 'analytics' | 'design-guide';
    onViewChange: (view: 'inventory' | 'monitoring' | 'admin' | 'create-evaluation' | 'evaluators' | 'evaluator-dashboard' | 'analytics' | 'design-guide') => void;
    onStartEvaluatorTour?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onChangePassword, onEditProfile, currentView, onViewChange, onStartEvaluatorTour }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isTourActive, setIsTourActive] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const tourTriggeredRef = useRef(false);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Auto-start tour only on first ever login for new accounts
    // Tour will NOT auto-start on page refresh or subsequent logins
    useEffect(() => {
        if (!user || tourTriggeredRef.current) return;
        
        const userId = user._id;
        const tourCompleted = hasTourBeenCompleted(userId);
        const isFirstLogin = getIsFirstLogin();
        const isFirstEver = isFirstEverLogin(userId);
        
        // Only auto-start tour if:
        // 1. This is a fresh login (not page refresh)
        // 2. This is the user's first ever login
        // 3. Tour hasn't been completed before
        if (isFirstLogin && isFirstEver && !tourCompleted) {
            tourTriggeredRef.current = true;
            const timer = setTimeout(() => {
                setIsTourActive(true);
                // Mark first login as completed after showing tour
                markFirstLoginCompleted(userId);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [user]);

    // Handle tour completion
    const handleTourEnd = () => {
        setIsTourActive(false);
        if (user) {
            markTourCompleted(user._id);
        }
    };

    // Manual tour start handler
    const handleManualTourStart = () => {
        setIsDropdownOpen(false);
        if (currentView === 'evaluator-dashboard' && onStartEvaluatorTour) {
            onStartEvaluatorTour();
        } else {
            onViewChange('inventory');
            setIsTourActive(true);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
            <TourGuide
                startTour={isTourActive}
                onTourEnd={handleTourEnd}
            />

            {/* Top Navigation Bar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm" role="navigation" aria-label="Main">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                    <div className="flex justify-between items-center h-14 sm:h-16">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12">
                                <img src={logo} alt="Logo" className="h-full w-full object-contain" />
                            </div>
                            <div className="min-w-0 flex-shrink-0">
                                <h1 className="text-sm sm:text-base lg:text-xl font-bold text-primary-600 tracking-tight truncate">
                                    <span className="hidden sm:inline">Learning Resource Evaluation Management System</span>
                                    <span className="sm:hidden">LR-EMS</span>
                                </h1>
                                <p className="text-xs text-gray-500 font-medium hidden sm:block">Grades 1 & 3 Records</p>
                            </div>


                        </div>
                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                            {user && (
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="text-right hidden md:block">
                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                        <div className="text-xs text-gray-500">@{user.username}</div>
                                    </div>
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            id="user-menu-btn"
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary-100 text-primary-600 font-bold hover:bg-primary-200 transition-colors text-sm sm:text-base"
                                            aria-haspopup="menu"
                                            aria-expanded={isDropdownOpen}
                                        >
                                            {user.name.charAt(0)}
                                        </button>
                                        {isDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 ring-1 ring-black ring-opacity-5 z-50" role="menu" aria-label="User menu">
                                                <div className="px-4 py-2 border-b border-gray-100 md:hidden">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-xs text-gray-500">@{user.username}</div>
                                                </div>
                                                <button
                                                    onClick={handleManualTourStart}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    role="menuitem"
                                                >
                                                    Start Tour
                                                </button>
                                                {onEditProfile && (
                                                    <button
                                                        onClick={() => {
                                                            setIsDropdownOpen(false);
                                                            onEditProfile();
                                                        }}
                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        role="menuitem"
                                                    >
                                                        Edit Profile
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setIsDropdownOpen(false);
                                                        onChangePassword?.();
                                                    }}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    role="menuitem"
                                                >
                                                    Change Password
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsDropdownOpen(false);
                                                        onLogout?.();
                                                    }}
                                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                    role="menuitem"
                                                >
                                                    Sign out
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <SkipNavLink />
            <main id="main-content" className="flex-grow" tabIndex={-1}>
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
                    {/* Navigation Tabs */}
                    <div className="mb-6 border-b border-gray-200 overflow-x-auto no-scrollbar" role="tablist" aria-label="Primary">
                        <div className="flex space-x-8 min-w-max">
                            {(!user?.evaluator_id || user?.is_admin_access) && (
                                <button
                                    onClick={() => onViewChange('inventory')}
                                    className={`${currentView === 'inventory' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium transition-colors`}
                                    role="tab"
                                    aria-selected={currentView === 'inventory'}
                                    aria-controls="tab-inventory"
                                >
                                    Inventory
                                </button>
                            )}
                            {user && (user.is_admin_access || user.evaluator_id) && (
                                <button
                                    onClick={() => onViewChange('evaluator-dashboard')}
                                    className={`${currentView === 'evaluator-dashboard' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium transition-colors`}
                                    role="tab"
                                    aria-selected={currentView === 'evaluator-dashboard'}
                                    aria-controls="tab-evaluator-dashboard"
                                >
                                    Evaluator Dashboard
                                </button>
                            )}
                            {(!user?.evaluator_id || user?.is_admin_access) && (
                                <button
                                    onClick={() => onViewChange('monitoring')}
                                    className={`${currentView === 'monitoring' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium transition-colors`}
                                    role="tab"
                                    aria-selected={currentView === 'monitoring'}
                                    aria-controls="tab-monitoring"
                                >
                                    Evaluation Monitoring
                                </button>
                            )}
                            {(!user?.evaluator_id || user?.is_admin_access) && (
                                <button
                                    onClick={() => onViewChange('analytics')}
                                    className={`${currentView === 'analytics' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium transition-colors`}
                                    role="tab"
                                    aria-selected={currentView === 'analytics'}
                                    aria-controls="tab-analytics"
                                >
                                    Analytics
                                </button>
                            )}
                            {(!user?.evaluator_id || user?.is_admin_access) && (
                                <button
                                    onClick={() => onViewChange('evaluators')}
                                    className={`${currentView === 'evaluators' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium transition-colors`}
                                    role="tab"
                                    aria-selected={currentView === 'evaluators'}
                                    aria-controls="tab-evaluators"
                                >
                                    Evaluators
                                </button>
                            )}
                            {user && (user.is_admin_access || ['jc', 'nonie', 'admin-l', 'admin-c'].includes(user.username?.toLowerCase() || '')) && (
                                <button
                                    onClick={() => onViewChange('create-evaluation')}
                                    className={`${currentView === 'create-evaluation' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium transition-colors`}
                                    role="tab"
                                    aria-selected={currentView === 'create-evaluation'}
                                    aria-controls="tab-create-evaluation"
                                >
                                    Admin Access
                                </button>
                            )}
                            {user?.is_admin_access && (
                                <button
                                    onClick={() => onViewChange('design-guide')}
                                    className={`${currentView === 'design-guide' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium transition-colors`}
                                    role="tab"
                                    aria-selected={currentView === 'design-guide'}
                                    aria-controls="tab-design-guide"
                                >
                                    Design Guide
                                </button>
                            )}
                        </div>
                    </div>
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-4 lg:px-8">
                    <p className="text-center text-xs sm:text-sm text-gray-400">
                        &copy; {new Date().getFullYear()} Book Data Management System. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};
