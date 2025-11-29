import React, { useState, useEffect, useMemo } from 'react';
import { EvaluatorProfile } from '../services/evaluatorService';
import { evaluatorDashboardService } from '../services/evaluatorDashboardService';
import { EvaluatorAssignment, EvaluatorStats } from '../types';

interface EvaluatorDetailViewProps {
    evaluator: EvaluatorProfile;
    onBack: () => void;
    onRefresh?: () => void;
    showBackButton?: boolean;
}

type GroupBy = 'event' | 'area';

const StatusDropdown = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
    const getColor = (status: string) => {
        switch (status) {
            case 'Done': return 'bg-green-100 text-green-800 border-green-200';
            case 'Ongoing Evaluation': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Pending': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`text-xs font-medium px-2 py-1 rounded-full border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 cursor-pointer ${getColor(value)}`}
            onClick={(e) => e.stopPropagation()}
        >
            <option value="Pending">Pending</option>
            <option value="Ongoing Evaluation">Ongoing Evaluation</option>
            <option value="Done">Done</option>
        </select>
    );
};

export const EvaluatorDetailView: React.FC<EvaluatorDetailViewProps> = ({ evaluator, onBack, onRefresh, showBackButton = true }) => {
    const [assignments, setAssignments] = useState<EvaluatorAssignment[]>([]);
    const [stats, setStats] = useState<EvaluatorStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [groupBy, setGroupBy] = useState<GroupBy>('event');
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (evaluator._id) {
            fetchData();
        }
    }, [evaluator._id]);

    const fetchData = async () => {
        if (!evaluator._id) return;

        setIsLoading(true);
        try {
            const [assignmentsData, statsData] = await Promise.all([
                evaluatorDashboardService.getEvaluatorAssignments(evaluator._id),
                evaluatorDashboardService.getEvaluatorStats(evaluator._id)
            ]);
            setAssignments(assignmentsData);
            setStats(statsData);

            // Auto-expand all groups
            const groups = new Set<string>();
            assignmentsData.forEach(a => {
                const key = groupBy === 'event' ? (a.eventName || 'General Monitoring') : a.learningArea;
                groups.add(key);
            });
            setExpandedGroups(groups);
        } catch (error) {
            console.error('Error fetching evaluator data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const groupedAssignments = useMemo(() => {
        const groups: Record<string, EvaluatorAssignment[]> = {};

        assignments.forEach(assignment => {
            const key = groupBy === 'event'
                ? (assignment.eventName || 'General Monitoring')
                : assignment.learningArea;

            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(assignment);
        });

        return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
    }, [assignments, groupBy]);

    const toggleGroup = (key: string) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(key)) {
            newExpanded.delete(key);
        } else {
            newExpanded.add(key);
        }
        setExpandedGroups(newExpanded);
    };

    const handleTaskUpdate = async (bookCode: string, taskField: string, newStatus: string) => {
        if (!evaluator._id) return;

        try {
            await evaluatorDashboardService.updateTaskStatus(
                evaluator._id,
                bookCode,
                taskField,
                newStatus
            );
            await fetchData();
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('Error updating task status:', error);
            alert('Failed to update task status');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-2 text-gray-500">Loading evaluator details...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back Button */}
            {showBackButton && (
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </button>
            )}

            {/* Evaluator Profile Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{evaluator.name}</h2>
                        <p className="text-gray-600 mt-1">{evaluator.designation}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span>{evaluator.regionDivision}</span>
                            <span>•</span>
                            <span>{evaluator.areaOfSpecialization}</span>
                            <span>•</span>
                            <span>{evaluator.depedEmail}</span>
                        </div>
                    </div>
                    {evaluator.isBlocked && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            Blocked
                        </span>
                    )}
                </div>
            </div>

            {/* Statistics */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-sm text-gray-500 font-medium">Total Assignments</div>
                        <div className="text-3xl font-bold text-gray-900 mt-1">{stats.totalAssignments}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-sm text-gray-500 font-medium">Completed</div>
                        <div className="text-3xl font-bold text-green-600 mt-1">{stats.completedAssignments}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-sm text-gray-500 font-medium">Pending Tasks</div>
                        <div className="text-3xl font-bold text-orange-600 mt-1">{stats.pendingTasks}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-sm text-gray-500 font-medium">Completion</div>
                        <div className="text-3xl font-bold text-blue-600 mt-1">{stats.completionPercentage}%</div>
                    </div>
                </div>
            )}

            {/* Group By Toggle */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Book Assignments</h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Group by:</span>
                    <select
                        value={groupBy}
                        onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="event">Event</option>
                        <option value="area">Learning Area</option>
                    </select>
                </div>
            </div>

            {/* Assignments */}
            {assignments.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
                    No assignments found for this evaluator
                </div>
            ) : (
                <div className="space-y-6">
                    {groupedAssignments.map(([groupKey, groupAssignments]) => {
                        const isExpanded = expandedGroups.has(groupKey);

                        return (
                            <div key={groupKey} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <button
                                    onClick={() => toggleGroup(groupKey)}
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <svg
                                            className={`h-5 w-5 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        <h4 className="text-lg font-semibold text-gray-900">{groupKey}</h4>
                                        <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                            {groupAssignments.length} {groupAssignments.length === 1 ? 'book' : 'books'}
                                        </span>
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="border-t border-gray-200">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Book Code</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Has TX & TM?</th>
                                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Individual Upload</th>
                                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Team Upload</th>
                                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Marginal Notes</th>
                                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Signed Summary</th>
                                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Clearance</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {groupAssignments.map((assignment) => {
                                                        const evalData = assignment.evaluatorData;
                                                        if (!evalData) return null;

                                                        return (
                                                            <tr key={assignment.bookCode} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{assignment.bookCode}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate" title={assignment.bookTitle}>
                                                                    {assignment.bookTitle}
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <button
                                                                        onClick={() => handleTaskUpdate(assignment.bookCode, 'hasTxAndTm', evalData.hasTxAndTm === 'Yes' ? 'No' : 'Yes')}
                                                                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium border transition-colors ${evalData.hasTxAndTm === 'Yes'
                                                                            ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                                                                            : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
                                                                            }`}
                                                                    >
                                                                        {evalData.hasTxAndTm}
                                                                    </button>
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <StatusDropdown
                                                                        value={evalData.individualUpload}
                                                                        onChange={(val) => handleTaskUpdate(assignment.bookCode, 'individualUpload', val)}
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <StatusDropdown
                                                                        value={evalData.teamUpload}
                                                                        onChange={(val) => handleTaskUpdate(assignment.bookCode, 'teamUpload', val)}
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <StatusDropdown
                                                                        value={evalData.txAndTmWithMarginalNotes}
                                                                        onChange={(val) => handleTaskUpdate(assignment.bookCode, 'txAndTmWithMarginalNotes', val)}
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <StatusDropdown
                                                                        value={evalData.signedSummaryForm}
                                                                        onChange={(val) => handleTaskUpdate(assignment.bookCode, 'signedSummaryForm', val)}
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <StatusDropdown
                                                                        value={evalData.clearance}
                                                                        onChange={(val) => handleTaskUpdate(assignment.bookCode, 'clearance', val)}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
