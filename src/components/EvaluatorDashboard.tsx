import React, { useState, useEffect, useMemo } from 'react';
import { evaluatorService, EvaluatorProfile } from '../services/evaluatorService';
import { evaluatorDashboardService } from '../services/evaluatorDashboardService';
import { DashboardStats } from '../types';
import { SearchIcon } from './Icons';
import { useEvaluatorDashboardTour } from './EvaluatorDashboardTour';
import { EvaluatorDetailView } from './EvaluatorDetailView';

interface AccessRule {
    learning_areas: string[];
    grade_levels: number[];
}

interface User {
    name: string;
    username: string;
    access_rules?: AccessRule[];
    is_admin_access?: boolean;
    evaluator_id?: string;
}

interface EvaluatorDashboardProps {
    user?: User;
    onTourStart?: (startTour: () => void) => void;
}

export const EvaluatorDashboard: React.FC<EvaluatorDashboardProps> = ({ user, onTourStart }) => {
    const [evaluators, setEvaluators] = useState<EvaluatorProfile[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEvaluator, setSelectedEvaluator] = useState<EvaluatorProfile | null>(null);
    const { startTour } = useEvaluatorDashboardTour({ user });

    // Register tour with parent
    useEffect(() => {
        if (onTourStart) {
            onTourStart(startTour);
        }
    }, [startTour, onTourStart]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [evalData, statsData] = await Promise.all([
                evaluatorService.getAllEvaluators(),
                evaluatorDashboardService.getOverallStats()
            ]);
            setEvaluators(evalData);
            setStats(statsData);

            // If user is an evaluator (not admin), auto-select their profile
            if (user && user.evaluator_id && !user.is_admin_access) {
                const evaluatorProfile = evalData.find(e => e._id === user.evaluator_id);
                if (evaluatorProfile) {
                    setSelectedEvaluator(evaluatorProfile);
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredEvaluators = useMemo(() => {
        let result = evaluators;

        // Filter by user access rules (if not admin)
        if (user && user.access_rules && user.access_rules.length > 0 && !user.is_admin_access) {
            const isSuperAdmin = user.access_rules.some(rule => rule.learning_areas.includes('*'));

            if (!isSuperAdmin) {
                const allowedAreas = new Set<string>();
                user.access_rules.forEach(rule => {
                    rule.learning_areas.forEach(area => allowedAreas.add(area));
                });

                result = result.filter(evaluator =>
                    allowedAreas.has(evaluator.areaOfSpecialization)
                );
            }
        }

        // Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(evaluator =>
                evaluator.name?.toLowerCase().includes(lowerTerm) ||
                evaluator.depedEmail?.toLowerCase().includes(lowerTerm) ||
                evaluator.areaOfSpecialization?.toLowerCase().includes(lowerTerm) ||
                evaluator.regionDivision?.toLowerCase().includes(lowerTerm)
            );
        }

        return result;
    }, [evaluators, searchTerm, user]);

    if (selectedEvaluator) {
        return (
            <EvaluatorDetailView
                evaluator={selectedEvaluator}
                onBack={() => setSelectedEvaluator(null)}
                onRefresh={fetchData}
                showBackButton={user?.is_admin_access}
            />
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-2 text-gray-500">Loading dashboard...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Evaluator Dashboard</h2>
                <p className="text-sm text-gray-500 mt-1">
                    View and manage evaluator assignments and progress
                </p>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="stats-section">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-sm text-gray-500 font-medium">Total Evaluators</div>
                        <div className="text-3xl font-bold text-gray-900 mt-1">{stats.totalEvaluators}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-sm text-gray-500 font-medium">Active Evaluators</div>
                        <div className="text-3xl font-bold text-primary-600 mt-1">{stats.activeEvaluators}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-sm text-gray-500 font-medium">Total Assignments</div>
                        <div className="text-3xl font-bold text-blue-600 mt-1">{stats.totalAssignments}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-sm text-gray-500 font-medium">Avg. Completion</div>
                        <div className="text-3xl font-bold text-green-600 mt-1">{stats.averageCompletionRate}%</div>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div className="relative" data-tour="search-input">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </span>
                <input
                    type="text"
                    placeholder="Search evaluators by name, email, region, or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm text-sm"
                />
            </div>

            {/* Evaluators Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEvaluators.map((evaluator, index) => (
                    <button
                        key={evaluator._id}
                        onClick={() => setSelectedEvaluator(evaluator)}
                        data-tour={index === 0 ? "evaluator-card" : undefined}
                        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all text-left"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">{evaluator.name}</h3>
                                <p className="text-sm text-gray-500">{evaluator.designation}</p>
                            </div>
                            {evaluator.isBlocked && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                    Blocked
                                </span>
                            )}
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center text-gray-600">
                                <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="truncate">{evaluator.regionDivision}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="truncate">{evaluator.areaOfSpecialization}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="truncate">{evaluator.depedEmail}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="text-xs text-gray-500">Click to view details</div>
                        </div>
                    </button>
                ))}

                {filteredEvaluators.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No evaluators found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
};
