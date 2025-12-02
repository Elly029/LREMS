import React, { useState, useEffect, useMemo } from 'react';
import { evaluatorService, EvaluatorProfile } from '../services/evaluatorService';
import { SearchIcon, PlusIcon, EditIcon, DeleteIcon } from './Icons';

interface AccessRule {
    learning_areas: string[];
    grade_levels: number[];
}

interface User {
    name: string;
    username: string;
    access_rules?: AccessRule[];
    role?: 'Administrator' | 'Facilitator' | 'Evaluator';
    is_admin_access?: boolean;
}

interface EvaluatorsListProps {
    onEdit?: (evaluator: EvaluatorProfile) => void;
    onDelete?: (id: string) => void;
    onCreate?: () => void;
    user?: User;
}

type SortKey = keyof EvaluatorProfile;
type SortDirection = 'asc' | 'desc';

export const EvaluatorsList: React.FC<EvaluatorsListProps> = ({ onEdit, onDelete, onCreate, user }) => {
    const [evaluators, setEvaluators] = useState<EvaluatorProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
        key: 'name',
        direction: 'asc'
    });

    useEffect(() => {
        fetchEvaluators();
    }, []);

    const fetchEvaluators = async () => {
        setIsLoading(true);
        try {
            const data = await evaluatorService.getAllEvaluators();
            setEvaluators(data);
        } catch (error) {
            console.error('Error fetching evaluators:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSort = (key: SortKey) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const filteredAndSortedEvaluators = useMemo(() => {
        let result = evaluators;

        // Filter by user access rules (if not admin)
        if (user && user.access_rules && user.access_rules.length > 0 && user.role !== 'Administrator') {
            // Check if user is super admin (has * access)
            const isSuperAdmin = user.access_rules.some(rule =>
                rule.learning_areas.includes('*')
            );

            if (!isSuperAdmin) {
                // Get all allowed learning areas from user's access rules
                const allowedAreas = new Set<string>();
                user.access_rules.forEach(rule => {
                    rule.learning_areas.forEach(area => allowedAreas.add(area));
                });

                // Filter evaluators to only those matching user's learning areas
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

        // Sort
        return [...result].sort((a, b) => {
            const aValue = a[sortConfig.key] || '';
            const bValue = b[sortConfig.key] || '';

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [evaluators, searchTerm, sortConfig, user]);

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete evaluator "${name}"?`)) {
            const success = await evaluatorService.deleteEvaluator(id);
            if (success) {
                await fetchEvaluators();
                if (onDelete) onDelete(id);
            }
        }
    };

    const handleToggleBlock = async (id: string, isBlocked: boolean) => {
        const success = await evaluatorService.toggleBlock(id, isBlocked);
        if (success) {
            await fetchEvaluators();
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-2 text-gray-500">Loading evaluators...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Evaluators</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage evaluator profiles and their information
                    </p>
                </div>
                <button
                    onClick={onCreate}
                    className="flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add New Evaluator
                </button>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
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
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <div className="text-sm text-gray-500">Total Evaluators</div>
                        <div className="text-2xl font-bold text-gray-900">{evaluators.length}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Filtered Results</div>
                        <div className="text-2xl font-bold text-primary-600">{filteredAndSortedEvaluators.length}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Specializations</div>
                        <div className="text-2xl font-bold text-gray-900">
                            {new Set(evaluators.map(e => e.areaOfSpecialization)).size}
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto max-h-[600px]">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('name')}
                                >
                                    Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('regionDivision')}
                                >
                                    Region/Division {sortConfig.key === 'regionDivision' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('designation')}
                                >
                                    Designation {sortConfig.key === 'designation' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('areaOfSpecialization')}
                                >
                                    Specialization {sortConfig.key === 'areaOfSpecialization' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                                >
                                    Contact
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                                >
                                    Email
                                </th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAndSortedEvaluators.map((evaluator, index) => (
                                <tr
                                    key={evaluator._id || `evaluator-${index}`}
                                    className={`${evaluator.isBlocked ? 'bg-red-50 opacity-75' : 'hover:bg-gray-50'} transition-colors`}
                                >
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                        <div className="flex items-center gap-2">
                                            {evaluator.name}
                                            {evaluator.isBlocked && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                    Blocked
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {evaluator.regionDivision}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {evaluator.designation}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {evaluator.areaOfSpecialization}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {evaluator.contactNumber}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {evaluator.depedEmail}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => evaluator._id && handleToggleBlock(evaluator._id, !evaluator.isBlocked)}
                                                className={`${evaluator.isBlocked ? 'text-green-400 hover:text-green-600' : 'text-orange-400 hover:text-orange-600'} transition-colors`}
                                                title={evaluator.isBlocked ? 'Unblock' : 'Block'}
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    {evaluator.isBlocked ? (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                                    ) : (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    )}
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => onEdit && onEdit(evaluator)}
                                                className="text-gray-400 hover:text-primary-600 transition-colors"
                                                title="Edit"
                                            >
                                                <EditIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => evaluator._id && handleDelete(evaluator._id, evaluator.name)}
                                                className="text-gray-400 hover:text-red-600 transition-colors"
                                                title="Delete"
                                            >
                                                <DeleteIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredAndSortedEvaluators.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No evaluators found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
