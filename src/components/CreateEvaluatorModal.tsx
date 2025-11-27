import React, { useState, useEffect } from 'react';
import { EvaluatorProfile } from '../services/evaluatorService';

interface CreateEvaluatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (evaluator: Omit<EvaluatorProfile, '_id'>) => void;
    evaluator?: EvaluatorProfile | null;
}

export const CreateEvaluatorModal: React.FC<CreateEvaluatorModalProps> = ({
    isOpen,
    onClose,
    onSave,
    evaluator
}) => {
    const [formData, setFormData] = useState<Omit<EvaluatorProfile, '_id'>>({
        name: '',
        regionDivision: '',
        designation: '',
        contactNumber: '',
        depedEmail: '',
        areaOfSpecialization: ''
    });

    useEffect(() => {
        if (evaluator) {
            setFormData({
                name: evaluator.name,
                regionDivision: evaluator.regionDivision,
                designation: evaluator.designation,
                contactNumber: evaluator.contactNumber,
                depedEmail: evaluator.depedEmail,
                areaOfSpecialization: evaluator.areaOfSpecialization
            });
        } else {
            setFormData({
                name: '',
                regionDivision: '',
                designation: '',
                contactNumber: '',
                depedEmail: '',
                areaOfSpecialization: ''
            });
        }
    }, [evaluator, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        {evaluator ? 'Edit Evaluator' : 'Create New Evaluator'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                placeholder="e.g., Juan Dela Cruz"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Region/Division <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.regionDivision}
                                onChange={(e) => setFormData({ ...formData, regionDivision: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                placeholder="e.g., NCR / Manila"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Designation <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.designation}
                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                placeholder="e.g., Master Teacher I"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                required
                                value={formData.contactNumber}
                                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                placeholder="e.g., 09123456789"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                DepEd Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.depedEmail}
                                onChange={(e) => setFormData({ ...formData, depedEmail: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                placeholder="e.g., juan.delacruz@deped.gov.ph"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Area of Specialization <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.areaOfSpecialization}
                                onChange={(e) => setFormData({ ...formData, areaOfSpecialization: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                placeholder="e.g., Science"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                        >
                            {evaluator ? 'Update Evaluator' : 'Create Evaluator'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
