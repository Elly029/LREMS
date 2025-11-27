import React, { useState, useEffect } from 'react';
import { EvaluatorMonitoring, Evaluator } from '../types';
import { CloseIcon, PlusIcon } from './Icons';
import { EvaluatorAutocomplete } from './EvaluatorAutocomplete';
import { evaluatorService, EvaluatorProfile } from '../services/evaluatorService';

interface ManageEvaluatorsModalProps {
    item: EvaluatorMonitoring;
    onClose: () => void;
    onSave: (updatedItem: EvaluatorMonitoring) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const EVALUATION_AREAS = [
    'Curriculum Compliance - Area 1',
    'Content - Area 2',
    'Instructional Design Compliance - Area 3',
    'Language - Area 4',
];

const emptyEvaluator: Omit<Evaluator, 'id'> = {
    name: '',
    regionDivision: '',
    designation: '',
    contactNumber: '',
    depedEmail: '',
    areaOfSpecialization: '',
    areasOfEvaluation: [],
    hasTxAndTm: 'No',
    individualUpload: 'Pending',
    teamUpload: 'Pending',
    txAndTmWithMarginalNotes: 'Pending',
    signedSummaryForm: 'Pending',
    clearance: 'Pending',
};

export const ManageEvaluatorsModal: React.FC<ManageEvaluatorsModalProps> = ({ item, onClose, onSave }) => {
    const [evaluators, setEvaluators] = useState<Evaluator[]>(item.evaluators.length > 0 ? item.evaluators : []);
    const [availableEvaluators, setAvailableEvaluators] = useState<EvaluatorProfile[]>([]);
    const [filteredEvaluators, setFilteredEvaluators] = useState<EvaluatorProfile[]>([]);

    useEffect(() => {
        // Load available evaluators from database
        evaluatorService.getAllEvaluators().then((allEvaluators) => {
            setAvailableEvaluators(allEvaluators);

            // Filter evaluators by the book's learning area
            const filtered = allEvaluators.filter((evaluator) => {
                const learningArea = item.learningArea.toLowerCase();
                const specialization = evaluator.areaOfSpecialization.toLowerCase();

                // Check if specialization contains the learning area
                // This handles cases like "Science", "General Science", "Biology/Physics", etc.
                return specialization.includes(learningArea) ||
                    learningArea.includes(specialization) ||
                    // Special case for MAKABANSA (Araling Panlipunan)
                    (learningArea.includes('makabansa') && specialization.includes('araling')) ||
                    (learningArea.includes('araling') && specialization.includes('makabansa')) ||
                    // Special case for GMRC/Values Education
                    (learningArea.includes('gmrc') && specialization.includes('values')) ||
                    (learningArea.includes('values') && specialization.includes('gmrc'));
            });

            setFilteredEvaluators(filtered);
            console.log(`Filtered ${filtered.length} evaluators for ${item.learningArea} from ${allEvaluators.length} total`);
        });
    }, [item.learningArea]);

    const handleAddEvaluator = () => {
        const newEvaluator: Evaluator = {
            id: generateId(),
            ...emptyEvaluator,
            areaOfSpecialization: item.learningArea, // Pre-fill with book's learning area
        };
        setEvaluators([...evaluators, newEvaluator]);
    };

    const handleRemoveEvaluator = (id: string) => {
        setEvaluators(evaluators.filter(e => e.id !== id));
    };

    const handleUpdateEvaluator = (id: string, field: keyof Evaluator, value: string | string[]) => {
        setEvaluators(evaluators.map(e =>
            e.id === id ? { ...e, [field]: value } : e
        ));
    };

    const handleSelectEvaluatorProfile = (evaluatorId: string, profile: EvaluatorProfile) => {
        setEvaluators(evaluators.map(e =>
            e.id === evaluatorId
                ? {
                    ...e,
                    id: profile._id || e.id, // Use the profile's database ID if available
                    name: profile.name,
                    regionDivision: profile.regionDivision,
                    designation: profile.designation,
                    contactNumber: profile.contactNumber,
                    depedEmail: profile.depedEmail,
                    areaOfSpecialization: profile.areaOfSpecialization,
                }
                : e
        ));
    };

    const toggleEvaluationArea = (evaluatorId: string, area: string) => {
        setEvaluators(evaluators.map(e => {
            if (e.id === evaluatorId) {
                const currentAreas = e.areasOfEvaluation || [];
                const newAreas = currentAreas.includes(area)
                    ? currentAreas.filter(a => a !== area)
                    : [...currentAreas, area];
                return { ...e, areasOfEvaluation: newAreas };
            }
            return e;
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate that all evaluators have required fields
        const hasEmptyFields = evaluators.some(ev =>
            !ev.name || !ev.regionDivision || !ev.designation || !ev.contactNumber || !ev.depedEmail
        );

        if (hasEmptyFields) {
            alert('Please fill in all required fields for each evaluator.');
            return;
        }

        // Validate that all evaluators have at least one area of evaluation
        const hasNoAreas = evaluators.some(ev => !ev.areasOfEvaluation || ev.areasOfEvaluation.length === 0);

        if (hasNoAreas) {
            alert('Please assign at least one Area of Evaluation to each evaluator.');
            return;
        }

        // Validate that each evaluation area has at least one assigned evaluator
        const coveredAreas = new Set<string>();
        evaluators.forEach(ev => {
            ev.areasOfEvaluation?.forEach(area => coveredAreas.add(area));
        });

        const uncoveredAreas = EVALUATION_AREAS.filter(area => !coveredAreas.has(area));
        if (uncoveredAreas.length > 0) {
            alert(`The following evaluation areas need at least one assigned evaluator:\n\n${uncoveredAreas.join('\n')}\n\nNote: A single evaluator can cover multiple areas.`);
            return;
        }

        onSave({ ...item, evaluators });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Manage Evaluators</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Book Code: <span className="font-medium">{item.bookCode}</span> |
                            Learning Area: <span className="font-medium">{item.learningArea}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {evaluators.length} evaluator{evaluators.length !== 1 ? 's' : ''} added (Max 10)
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {evaluators.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <p className="text-gray-500 mb-4">No evaluators added yet. Click the button below to add evaluators.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {evaluators.map((evaluator, index) => (
                                <div key={evaluator.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-semibold text-gray-900">Evaluator #{index + 1}</h3>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveEvaluator(evaluator.id)}
                                            className="text-red-600 hover:text-red-700 text-sm font-medium hover:underline"
                                        >
                                            Remove
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Name <span className="text-red-500">*</span>
                                                <span className="text-xs text-gray-500 ml-2">(Type to search)</span>
                                            </label>
                                            <EvaluatorAutocomplete
                                                value={evaluator.name}
                                                onChange={(value) => handleUpdateEvaluator(evaluator.id, 'name', value)}
                                                onSelectEvaluator={(profile) => handleSelectEvaluatorProfile(evaluator.id, profile)}
                                                evaluators={filteredEvaluators}
                                                placeholder="e.g., Juan Dela Cruz"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Region/Division <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={evaluator.regionDivision}
                                                onChange={(e) => handleUpdateEvaluator(evaluator.id, 'regionDivision', e.target.value)}
                                                placeholder="e.g., NCR / Manila"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Designation <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={evaluator.designation}
                                                onChange={(e) => handleUpdateEvaluator(evaluator.id, 'designation', e.target.value)}
                                                placeholder="e.g., Master Teacher I"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Contact Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                value={evaluator.contactNumber}
                                                onChange={(e) => handleUpdateEvaluator(evaluator.id, 'contactNumber', e.target.value)}
                                                placeholder="e.g., 09123456789"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                DepEd Email <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                value={evaluator.depedEmail}
                                                onChange={(e) => handleUpdateEvaluator(evaluator.id, 'depedEmail', e.target.value)}
                                                placeholder="e.g., juan.delacruz@deped.gov.ph"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Area of Specialization
                                            </label>
                                            <input
                                                type="text"
                                                value={evaluator.areaOfSpecialization}
                                                onChange={(e) => handleUpdateEvaluator(evaluator.id, 'areaOfSpecialization', e.target.value)}
                                                placeholder="e.g., Science"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                                            />
                                        </div>

                                        <div className="md:col-span-2 lg:col-span-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Area(s) of Evaluation <span className="text-red-500">*</span>
                                                <span className="text-xs text-gray-500 ml-2">(Select one or more)</span>
                                            </label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {EVALUATION_AREAS.map((area) => {
                                                    const isSelected = evaluator.areasOfEvaluation?.includes(area) || false;
                                                    return (
                                                        <button
                                                            key={area}
                                                            type="button"
                                                            onClick={() => toggleEvaluationArea(evaluator.id, area)}
                                                            className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all text-left ${isSelected
                                                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-400'
                                                                    }`}>
                                                                    {isSelected && (
                                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                                <span>{area}</span>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {evaluator.areasOfEvaluation && evaluator.areasOfEvaluation.length > 0 && (
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Selected: {evaluator.areasOfEvaluation.length} area{evaluator.areasOfEvaluation.length > 1 ? 's' : ''}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleAddEvaluator}
                            disabled={evaluators.length >= 10}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${evaluators.length >= 10
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                        >
                            <PlusIcon className="h-5 w-5" />
                            Add Evaluator {evaluators.length >= 10 && '(Max 10)'}
                        </button>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 rounded-lg font-medium transition-colors shadow-sm bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md"
                            >
                                Save Evaluators
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
