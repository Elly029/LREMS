import React, { useState, useEffect } from 'react';
import { CloseIcon } from './Icons';

interface EditEventModalProps {
    eventName: string;
    onClose: () => void;
    onSave: (newEventName: string) => void;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({ eventName, onClose, onSave }) => {
    const [editedEventName, setEditedEventName] = useState(eventName);

    useEffect(() => {
        setEditedEventName(eventName);
    }, [eventName]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editedEventName.trim()) {
            alert('Event name cannot be empty.');
            return;
        }

        onSave(editedEventName.trim());
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
                <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Edit Event Name</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Update the name for this evaluation event
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Event Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={editedEventName}
                            onChange={(e) => setEditedEventName(e.target.value)}
                            placeholder="e.g., FOR RELEASE TO PUBLISHERS IN PREP DECEMBER 5"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                            required
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            This name will be displayed as the heading for all books in this event.
                        </p>
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
