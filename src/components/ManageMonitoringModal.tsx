import React, { useState } from 'react';
import { EvaluatorMonitoring, Book } from '../types';

interface ManageMonitoringModalProps {
    item: EvaluatorMonitoring;
    allBooks: Book[];
    onClose: () => void;
    onSave: (updatedItem: EvaluatorMonitoring) => void;
    onRemove: (bookCode: string) => void;
}

const XIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export const ManageMonitoringModal: React.FC<ManageMonitoringModalProps> = ({
    item,
    allBooks,
    onClose,
    onSave,
    onRemove
}) => {
    const [selectedBookCode, setSelectedBookCode] = useState<string>(item.bookCode);
    const [eventName, setEventName] = useState(item.eventName || '');
    const [eventDate, setEventDate] = useState(item.eventDate || '');

    const handleSave = () => {
        const selectedBook = allBooks.find(b => b.bookCode === selectedBookCode);
        if (!selectedBook) {
            alert('Please select a valid book');
            return;
        }

        const updatedItem: EvaluatorMonitoring = {
            ...item,
            bookCode: selectedBookCode,
            learningArea: selectedBook.learningArea,
            eventName: eventName || undefined,
            eventDate: eventDate || undefined,
        };

        onSave(updatedItem);
        onClose();
    };

    const handleRemove = () => {
        if (window.confirm(`Are you sure you want to remove "${item.bookCode}" from monitoring?`)) {
            onRemove(item.bookCode);
            onClose();
        }
    };

    const currentBook = allBooks.find(b => b.bookCode === item.bookCode);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Edit Monitoring Entry</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Current Book Info */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Current Book</h3>
                        {currentBook ? (
                            <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Code:</span> {currentBook.bookCode}</p>
                                <p><span className="font-medium">Title:</span> {currentBook.title}</p>
                                <p><span className="font-medium">Learning Area:</span> {currentBook.learningArea}</p>
                                <p><span className="font-medium">Publisher:</span> {currentBook.publisher}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-red-600">Book not found in inventory</p>
                        )}
                    </div>

                    {/* Change Book */}
                    <div>
                        <label htmlFor="book-select" className="block text-sm font-medium text-gray-700 mb-2">
                            Change Book
                        </label>
                        <select
                            id="book-select"
                            value={selectedBookCode}
                            onChange={(e) => setSelectedBookCode(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        >
                            <option value="">Select a book...</option>
                            {allBooks.map(book => (
                                <option key={book.bookCode} value={book.bookCode}>
                                    {book.bookCode} - {book.title} ({book.learningArea})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="event-name" className="block text-sm font-medium text-gray-700 mb-2">
                                Event Name <span className="text-gray-400 font-normal">(Optional)</span>
                            </label>
                            <input
                                id="event-name"
                                type="text"
                                value={eventName}
                                onChange={(e) => setEventName(e.target.value)}
                                placeholder="e.g., Q4 Science Textbook Evaluation"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="event-date" className="block text-sm font-medium text-gray-700 mb-2">
                                Event Date <span className="text-gray-400 font-normal">(Optional)</span>
                            </label>
                            <input
                                id="event-date"
                                type="text"
                                value={eventDate}
                                onChange={(e) => setEventDate(e.target.value)}
                                placeholder="e.g., 11/24/2025 - 12/15/2025"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    {/* Evaluators Info */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-900 mb-2">Evaluators</h3>
                        <p className="text-sm text-blue-700">
                            {item.evaluators.length} evaluator{item.evaluators.length !== 1 ? 's' : ''} assigned
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            Note: Evaluators will remain assigned to this entry
                        </p>
                    </div>
                </div>

                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center gap-3">
                    <button
                        onClick={handleRemove}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                    >
                        <TrashIcon className="h-4 w-4" />
                        Remove from Monitoring
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
