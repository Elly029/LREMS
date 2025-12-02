import React, { useState, useMemo } from 'react';
import { EvaluatorMonitoring, Evaluator, Book } from '../types';
import { ManageEvaluatorsModal } from './ManageEvaluatorsModal';
import { ManageMonitoringModal } from './ManageMonitoringModal';
import { bookApi } from '../services/bookService';
import { AddRemarkIcon, EditIcon } from './Icons';
import { EditEventModal } from './EditEventModal';

interface AccessRule {
    learning_areas: string[];
    grade_levels: number[];
}

interface User {
    _id: string;
    username: string;
    name: string;
    token: string;
    access_rules?: AccessRule[];
    role?: 'Administrator' | 'Facilitator' | 'Evaluator';
    is_admin_access?: boolean;
    evaluator_id?: string;
}

interface MonitoringTableProps {
    data: EvaluatorMonitoring[];
    headerOffset?: number;
    onUpdate?: (updatedItem: EvaluatorMonitoring) => void;
    onRemove?: (bookCode: string) => void;
    onViewRemarks?: (book: Book) => void;
    onAddRemark?: (book: Book) => void;
    onUpdateEventName?: (oldEventName: string, newEventName: string) => void;
    allBooks?: Book[];
    user?: User;
}

const UserGroupIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const XCircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const MonitoringTable: React.FC<MonitoringTableProps> = ({
    data,
    headerOffset = 0,
    onUpdate,
    onRemove,
    onViewRemarks,
    onAddRemark,
    onUpdateEventName,
    allBooks = [],
    user
}) => {
    const [managingItem, setManagingItem] = useState<EvaluatorMonitoring | null>(null);
    const [editingItem, setEditingItem] = useState<EvaluatorMonitoring | null>(null);
    const [expandedBooks, setExpandedBooks] = useState<Set<string>>(new Set());
    const [editingEventName, setEditingEventName] = useState<string | null>(null);

    const toggleExpand = (bookCode: string) => {
        const newExpanded = new Set(expandedBooks);
        if (newExpanded.has(bookCode)) {
            newExpanded.delete(bookCode);
        } else {
            newExpanded.add(bookCode);
        }
        setExpandedBooks(newExpanded);
    };

    const groupedData = useMemo(() => {
        const groups: Record<string, Record<string, EvaluatorMonitoring[]>> = {};
        if (data.length === 0) return groups;

        data.forEach(item => {
            const eventKey = item.eventName || 'General Monitoring';
            const areaKey = item.learningArea || 'Unassigned';

            if (!groups[eventKey]) {
                groups[eventKey] = {};
            }
            if (!groups[eventKey][areaKey]) {
                groups[eventKey][areaKey] = [];
            }
            groups[eventKey][areaKey].push(item);
        });

        // Sort events and areas
        const sortedGroups: Record<string, Record<string, EvaluatorMonitoring[]>> = {};

        Object.keys(groups).sort().forEach(eventKey => {
            sortedGroups[eventKey] = {};
            Object.keys(groups[eventKey]).sort().forEach(areaKey => {
                sortedGroups[eventKey][areaKey] = groups[eventKey][areaKey];
            });
        });

        return sortedGroups;
    }, [data]);

    const getOverallProgress = (evaluators: Evaluator[]) => {
        if (evaluators.length === 0) return 0;

        const totalFields = evaluators.length * 5; // 5 status fields per evaluator
        let completedFields = 0;

        evaluators.forEach(ev => {
            if (ev.hasTxAndTm === 'Yes') completedFields++;
            if (ev.individualUpload === 'Done') completedFields++;
            if (ev.teamUpload === 'Done') completedFields++;
            if (ev.txAndTmWithMarginalNotes === 'Done') completedFields++;
            if (ev.signedSummaryForm === 'Done') completedFields++;
            if (ev.clearance === 'Done') completedFields++;
        });

        return Math.round((completedFields / (totalFields + evaluators.length)) * 100);
    };

    if (data.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
                No monitoring data available
            </div>
        );
    }

    return (
        <>
            <div className="space-y-12 pb-10">
                {Object.entries(groupedData).map(([eventName, areas]) => (
                    <div key={eventName} className="space-y-6">
                        <div className="border-b border-gray-200 pb-2 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">{eventName}</h2>
                            {user?.role === 'Administrator' && onUpdateEventName && (
                                <button
                                    onClick={() => setEditingEventName(eventName)}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                    title="Edit event name"
                                >
                                    <EditIcon className="h-4 w-4" />
                                    Edit Event
                                </button>
                            )}
                        </div>

                        {Object.entries(areas).map(([category, items]) => (
                            <div key={`${eventName}-${category}`} className="space-y-3 pl-4 border-l-2 border-gray-100 ml-2">
                                <div className="flex items-center gap-3 px-1">
                                    <div className="h-6 w-1.5 bg-primary-600 rounded-full"></div>
                                    <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wide">{category}</h3>
                                    <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                        {items.length} {items.length === 1 ? 'book' : 'books'}
                                    </span>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12"></th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[120px]">Book Code</th>
                                                    <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[120px]">Evaluators</th>
                                                    <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[120px]">Progress</th>
                                                    <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[100px]">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {items.map((item) => {
                                                    const isExpanded = expandedBooks.has(item.bookCode);
                                                    const progress = getOverallProgress(item.evaluators);

                                                    // Check area coverage instead of evaluator count
                                                    const EVALUATION_AREAS = [
                                                        'Curriculum Compliance - Area 1',
                                                        'Content - Area 2',
                                                        'Instructional Design Compliance - Area 3',
                                                        'Language - Area 4',
                                                    ];
                                                    const coveredAreas = new Set<string>();
                                                    item.evaluators.forEach(ev => {
                                                        ev.areasOfEvaluation?.forEach(area => coveredAreas.add(area));
                                                    });
                                                    const areaCoverage = coveredAreas.size;
                                                    const allAreasCovered = areaCoverage === EVALUATION_AREAS.length;

                                                    return (
                                                        <React.Fragment key={item.bookCode}>
                                                            <tr className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-4 py-3">
                                                                    {item.evaluators.length > 0 && (
                                                                        <button
                                                                            onClick={() => toggleExpand(item.bookCode)}
                                                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                                                        >
                                                                            <svg className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                            </svg>
                                                                        </button>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.bookCode}</td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${allAreasCovered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                                            }`}>
                                                                            {item.evaluators.length} evaluator{item.evaluators.length !== 1 ? 's' : ''} • {areaCoverage}/4 areas
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                                                            <div
                                                                                className={`h-2 rounded-full transition-all ${progress === 100 ? 'bg-green-500' : progress >= 50 ? 'bg-blue-500' : 'bg-orange-500'
                                                                                    }`}
                                                                                style={{ width: `${progress}%` }}
                                                                            ></div>
                                                                        </div>
                                                                        <span className="text-xs font-medium text-gray-600">{progress}%</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        {user?.role === 'Administrator' && (
                                                                            <button
                                                                                onClick={() => setEditingItem(item)}
                                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors"
                                                                                title="Edit monitoring entry"
                                                                            >
                                                                                <EditIcon className="h-4 w-4" />
                                                                                Edit
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            onClick={() => setManagingItem(item)}
                                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700 transition-colors"
                                                                            title="Manage evaluators"
                                                                        >
                                                                            <UserGroupIcon className="h-4 w-4" />
                                                                            Manage
                                                                        </button>
                                                                        <button
                                                                            onClick={async () => {
                                                                                // Try to find in loaded books first
                                                                                let book = allBooks.find(b => b.bookCode === item.bookCode);

                                                                                // If not found, try loose matching
                                                                                if (!book) {
                                                                                    book = allBooks.find(b => b.bookCode.trim() === item.bookCode.trim());
                                                                                }

                                                                                // If still not found, try fetching from API
                                                                                if (!book) {
                                                                                    try {
                                                                                        book = await bookApi.getBook(item.bookCode);
                                                                                    } catch (err) {
                                                                                        console.error('Failed to fetch book details:', err);
                                                                                        alert('Failed to load book details. Please try again.');
                                                                                        return;
                                                                                    }
                                                                                }

                                                                                if (book && onAddRemark) {
                                                                                    onAddRemark(book);
                                                                                }
                                                                            }}
                                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                                                                            title="Add remark"
                                                                        >
                                                                            <AddRemarkIcon className="h-4 w-4" />
                                                                            Add
                                                                        </button>
                                                                        <button
                                                                            onClick={async () => {
                                                                                // Try to find in loaded books first
                                                                                let book = allBooks.find(b => b.bookCode === item.bookCode);

                                                                                // If not found, try loose matching
                                                                                if (!book) {
                                                                                    book = allBooks.find(b => b.bookCode.trim() === item.bookCode.trim());
                                                                                }

                                                                                // If still not found, try fetching from API
                                                                                if (!book) {
                                                                                    try {
                                                                                        book = await bookApi.getBook(item.bookCode);
                                                                                    } catch (err) {
                                                                                        console.error('Failed to fetch book details:', err);
                                                                                        alert('Failed to load book details. Please try again.');
                                                                                        return;
                                                                                    }
                                                                                }

                                                                                if (book && onViewRemarks) {
                                                                                    onViewRemarks(book);
                                                                                }
                                                                            }}
                                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors"
                                                                            title="View remarks"
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                                            </svg>
                                                                            Remarks
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>

                                                            {isExpanded && item.evaluators.length > 0 && (
                                                                <tr>
                                                                    <td colSpan={5} className="px-4 py-4 bg-gray-50">
                                                                        <div className="space-y-3">
                                                                            {item.evaluators.map((evaluator) => (
                                                                                <div key={evaluator.id} className="bg-white rounded-lg border border-gray-200 p-4">
                                                                                    <div className="flex items-start justify-between mb-3">
                                                                                        <div className="flex-1">
                                                                                            <h4 className="font-semibold text-gray-900">{evaluator.name || 'Unnamed'}</h4>
                                                                                            <p className="text-sm text-gray-500">{evaluator.designation} | {evaluator.regionDivision}</p>
                                                                                            {evaluator.areasOfEvaluation && evaluator.areasOfEvaluation.length > 0 && (
                                                                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                                                                    {evaluator.areasOfEvaluation.map((area, areaIdx) => (
                                                                                                        <span
                                                                                                            key={areaIdx}
                                                                                                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                                                                                                        >
                                                                                                            {area}
                                                                                                        </span>
                                                                                                    ))}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-3">
                                                                                        <div className="flex items-center gap-2">
                                                                                            {evaluator.hasTxAndTm === 'Yes' ? (
                                                                                                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                                                                            ) : (
                                                                                                <XCircleIcon className="h-5 w-5 text-red-400" />
                                                                                            )}
                                                                                            <span className="text-xs text-gray-600">TX & TM</span>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-2">
                                                                                            {evaluator.individualUpload === 'Done' ? (
                                                                                                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                                                                            ) : (
                                                                                                <XCircleIcon className="h-5 w-5 text-orange-400" />
                                                                                            )}
                                                                                            <span className="text-xs text-gray-600">Individual</span>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-2">
                                                                                            {evaluator.teamUpload === 'Done' ? (
                                                                                                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                                                                            ) : (
                                                                                                <XCircleIcon className="h-5 w-5 text-orange-400" />
                                                                                            )}
                                                                                            <span className="text-xs text-gray-600">Team</span>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-2">
                                                                                            {evaluator.txAndTmWithMarginalNotes === 'Done' ? (
                                                                                                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                                                                            ) : (
                                                                                                <XCircleIcon className="h-5 w-5 text-orange-400" />
                                                                                            )}
                                                                                            <span className="text-xs text-gray-600">Notes</span>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-2">
                                                                                            {evaluator.signedSummaryForm === 'Done' ? (
                                                                                                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                                                                            ) : (
                                                                                                <XCircleIcon className="h-5 w-5 text-orange-400" />
                                                                                            )}
                                                                                            <span className="text-xs text-gray-600">Summary</span>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-2">
                                                                                            {evaluator.clearance === 'Done' ? (
                                                                                                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                                                                            ) : (
                                                                                                <XCircleIcon className="h-5 w-5 text-orange-400" />
                                                                                            )}
                                                                                            <span className="text-xs text-gray-600">Clearance</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div >
                ))}
            </div >

            {managingItem && (
                <ManageEvaluatorsModal
                    item={managingItem}
                    onClose={() => setManagingItem(null)}
                    onSave={(updatedItem) => {
                        if (onUpdate) {
                            onUpdate(updatedItem);
                        }
                    }}
                />
            )}

            {
                editingItem && (
                    <ManageMonitoringModal
                        item={editingItem}
                        allBooks={allBooks}
                        onClose={() => setEditingItem(null)}
                        onSave={(updatedItem) => {
                            if (onUpdate) {
                                onUpdate(updatedItem);
                            }
                        }}
                        onRemove={(bookCode) => {
                            if (onRemove) {
                                onRemove(bookCode);
                            }
                        }}
                    />
                )
            }

            {editingEventName && onUpdateEventName && (
                <EditEventModal
                    eventName={editingEventName}
                    onClose={() => setEditingEventName(null)}
                    onSave={(newEventName) => {
                        onUpdateEventName(editingEventName, newEventName);
                        setEditingEventName(null);
                    }}
                />
            )}
        </>
    );
};
