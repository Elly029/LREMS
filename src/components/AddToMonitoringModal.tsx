import React, { useState } from 'react';
import { Book } from '../types';
import { CloseIcon, PlusIcon } from './Icons';

interface AddToMonitoringModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (selectedBooks: Book[], eventName?: string, eventDate?: string) => void;
    allBooks: Book[];
    existingBookCodes: Set<string>;
}

export const AddToMonitoringModal: React.FC<AddToMonitoringModalProps> = ({
    isOpen,
    onClose,
    onAdd,
    allBooks,
    existingBookCodes,
}) => {
    const [selectedBookCodes, setSelectedBookCodes] = useState<Set<string>>(new Set());
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    // Filter available books (not already in monitoring)
    const availableBooks = allBooks.filter(book => !existingBookCodes.has(book.bookCode));

    // Search filter
    const filteredBooks = availableBooks.filter(book =>
        book.bookCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.learningArea.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.publisher.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleBook = (bookCode: string) => {
        const newSelected = new Set(selectedBookCodes);
        if (newSelected.has(bookCode)) {
            newSelected.delete(bookCode);
        } else {
            newSelected.add(bookCode);
        }
        setSelectedBookCodes(newSelected);
    };

    const selectAll = () => {
        setSelectedBookCodes(new Set(filteredBooks.map(b => b.bookCode)));
    };

    const deselectAll = () => {
        setSelectedBookCodes(new Set());
    };

    const handleSubmit = () => {
        if (selectedBookCodes.size === 0) {
            alert('Please select at least one book to add.');
            return;
        }

        const selectedBooks = allBooks.filter(book => selectedBookCodes.has(book.bookCode));
        onAdd(selectedBooks, eventName || undefined, eventDate || undefined);

        // Reset form
        setSelectedBookCodes(new Set());
        setEventName('');
        setEventDate('');
        setSearchTerm('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Add Books to Monitoring</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Select books from inventory to add to evaluation monitoring
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                    {/* Event Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Event Name <span className="text-gray-400 font-normal">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                value={eventName}
                                onChange={(e) => setEventName(e.target.value)}
                                placeholder="e.g., FOR RELEASE TO PUBLISHERS IN PREP DECEMBER 5"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Event Date <span className="text-gray-400 font-normal">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                value={eventDate}
                                onChange={(e) => setEventDate(e.target.value)}
                                placeholder="e.g., 11/24/2025 - 11/30/2025"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                            />
                        </div>
                    </div>

                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Books
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by code, title, learning area, or publisher..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                    </div>

                    {/* Selection Controls */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">{selectedBookCodes.size}</span> of{' '}
                            <span className="font-semibold">{filteredBooks.length}</span> books selected
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={selectAll}
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Select All
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                                onClick={deselectAll}
                                className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                            >
                                Deselect All
                            </button>
                        </div>
                    </div>

                    {/* Book List */}
                    {filteredBooks.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <p className="text-gray-500">
                                {availableBooks.length === 0
                                    ? 'All books are already in monitoring!'
                                    : 'No books match your search.'}
                            </p>
                        </div>
                    ) : (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-12">
                                            Select
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Book Code
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Title
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Learning Area
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Grade
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 max-h-96 overflow-y-auto">
                                    {filteredBooks.map((book) => (
                                        <tr
                                            key={book.bookCode}
                                            onClick={() => toggleBook(book.bookCode)}
                                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedBookCodes.has(book.bookCode)}
                                                    onChange={() => toggleBook(book.bookCode)}
                                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {book.bookCode}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {book.title}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {book.learningArea}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                Grade {book.gradeLevel}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={selectedBookCodes.size === 0}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors shadow-sm ${selectedBookCodes.size === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md'
                            }`}
                    >
                        <PlusIcon className="h-5 w-5" />
                        Add {selectedBookCodes.size > 0 && `(${selectedBookCodes.size})`} to Monitoring
                    </button>
                </div>
            </div>
        </div>
    );
};
