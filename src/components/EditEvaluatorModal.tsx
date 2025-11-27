import React, { useState } from 'react';
import { Evaluator } from '../types';
import { CloseIcon } from './Icons';

interface EditEvaluatorModalProps {
    evaluator: Evaluator;
    bookCode: string;
    onClose: () => void;
    onSave: (updatedEvaluator: Evaluator) => void;
}

export const EditEvaluatorModal: React.FC<EditEvaluatorModalProps> = ({ evaluator, bookCode, onClose, onSave }) => {
    const [formData, setFormData] = useState<Evaluator>(evaluator);

    const handleChange = (field: keyof Evaluator, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Edit Evaluator Information</h2>
                        <p className="text-sm text-gray-500 mt-1">Book Code: {bookCode}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Evaluator Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="e.g., Juan Dela Cruz"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="regionDivision" className="block text-sm font-medium text-gray-700 mb-1">
                                Region/Division <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="regionDivision"
                                type="text"
                                value={formData.regionDivision}
                                onChange={(e) => handleChange('regionDivision', e.target.value)}
                                placeholder="e.g., NCR / Manila"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">
                                Designation <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="designation"
                                type="text"
                                value={formData.designation}
                                onChange={(e) => handleChange('designation', e.target.value)}
                                placeholder="e.g., Master Teacher I"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="contactNumber"
                                type="tel"
                                value={formData.contactNumber}
                                onChange={(e) => handleChange('contactNumber', e.target.value)}
                                placeholder="e.g., 09123456789"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="depedEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                DepEd Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="depedEmail"
                                type="email"
                                value={formData.depedEmail}
                                onChange={(e) => handleChange('depedEmail', e.target.value)}
                                placeholder="e.g., juan.delacruz@deped.gov.ph"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="areaOfSpecialization" className="block text-sm font-medium text-gray-700 mb-1">
                                Area of Specialization
                            </label>
                            <input
                                id="areaOfSpecialization"
                                type="text"
                                value={formData.areaOfSpecialization}
                                onChange={(e) => handleChange('areaOfSpecialization', e.target.value)}
                                placeholder="e.g., Science"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="areasOfEvaluation" className="block text-sm font-medium text-gray-700 mb-1">
                                Areas of Evaluation
                            </label>
                            <input
                                id="areasOfEvaluation"
                                type="text"
                                value={formData.areasOfEvaluation.join(', ')}
                                onChange={(e) => handleChange('areasOfEvaluation', e.target.value.split(',').map(s => s.trim()))}
                                placeholder="e.g., Content, Language"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors shadow-sm hover:shadow-md"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
