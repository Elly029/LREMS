import React, { useState, useMemo, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Book } from '../types';
import { SearchIcon, CalendarIcon, PlusIcon, EditIcon, DeleteIcon, RefreshIcon } from './Icons';
import { apiClient } from '../services/api';

interface CreateEvaluationEventProps {
    existingBookCodes: Set<string>;
    onCreateEvent: (eventDetails: { name: string; date: string }, selectedBooks: Book[]) => void;
    onAddBook: () => void;
    onEditBook: (book: Book) => void;
    onDeleteBook: (bookCode: string) => void;
    dataVersion: number;
}

type SortKey = keyof Book | 'status';
type SortDirection = 'asc' | 'desc';

export const CreateEvaluationEvent: React.FC<CreateEvaluationEventProps> = ({
    existingBookCodes,
    onCreateEvent,
    onAddBook,
    onEditBook,
    onDeleteBook,
    dataVersion
}) => {
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBooks = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true);
            const response = await apiClient.get<any>('/books', {
                limit: 1000,
                adminView: true
            });
            
            if (response && response.data) {
                // Transform backend data to frontend format
                const transformedBooks = response.data.map((book: any) => ({
                    bookCode: book.book_code || book.bookCode,
                    learningArea: book.learning_area || book.learningArea,
                    gradeLevel: book.grade_level || book.gradeLevel,
                    publisher: book.publisher,
                    title: book.title,
                    status: book.status,
                    isNew: book.is_new !== undefined ? book.is_new : book.isNew,
                    remarks: book.remarks || []
                }));
                setBooks(transformedBooks);
            }
        } catch (error) {
            console.error('Error fetching books for admin access:', error);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBooks();
    }, [dataVersion, fetchBooks]);

    // Auto-refresh data every 30 seconds
    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchBooks(false); // Silent refresh
        }, 30000);
        
        return () => clearInterval(intervalId);
    }, [fetchBooks]);

    const [eventName, setEventName] = useState('');
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
    const [startDate, endDate] = dateRange;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBookCodes, setSelectedBookCodes] = useState<Set<string>>(new Set());

    // Filters & Sort
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [learningAreaFilter, setLearningAreaFilter] = useState<string>('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
        key: 'bookCode',
        direction: 'asc'
    });

    // Derived options for filters
    const learningAreas = useMemo(() => Array.from(new Set(books.map(b => b.learningArea).filter(Boolean))).sort(), [books]);
    const statuses = useMemo(() => Array.from(new Set(books.map(b => b.status).filter(Boolean))).sort(), [books]);

    const handleSort = (key: SortKey) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const filteredBooks = useMemo(() => {
        let result = books;

        // Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(book =>
                (book.title?.toLowerCase() || '').includes(lowerTerm) ||
                (book.bookCode?.toLowerCase() || '').includes(lowerTerm) ||
                (book.publisher?.toLowerCase() || '').includes(lowerTerm)
            );
        }

        // Filters
        if (statusFilter) {
            result = result.filter(book => book.status === statusFilter);
        }
        if (learningAreaFilter) {
            result = result.filter(book => book.learningArea === learningAreaFilter);
        }

        // Sort
        return [...result].sort((a, b) => {
            const aValue = a[sortConfig.key] || '';
            const bValue = b[sortConfig.key] || '';

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [books, searchTerm, statusFilter, learningAreaFilter, sortConfig]);

    const handleToggleSelect = (bookCode: string) => {
        const newSelected = new Set(selectedBookCodes);
        if (newSelected.has(bookCode)) {
            newSelected.delete(bookCode);
        } else {
            newSelected.add(bookCode);
        }
        setSelectedBookCodes(newSelected);
    };

    const handleSelectAll = () => {
        const selectableBooks = filteredBooks.filter(book => 
            book.bookCode && !existingBookCodes.has(book.bookCode)
        );
        
        if (selectedBookCodes.size === selectableBooks.length && selectableBooks.length > 0) {
            setSelectedBookCodes(new Set());
        } else {
            const newSelected = new Set<string>();
            selectableBooks.forEach(book => {
                newSelected.add(book.bookCode);
            });
            setSelectedBookCodes(newSelected);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedBookCodes.size === 0) {
            alert('Please select at least one book.');
            return;
        }

        const selectedBooks = books.filter(book => book.bookCode && selectedBookCodes.has(book.bookCode));

        let dateString = '';
        if (startDate) {
            dateString = startDate.toLocaleDateString();
            if (endDate) {
                dateString += ` - ${endDate.toLocaleDateString()}`;
            }
        }

        onCreateEvent({ name: eventName, date: dateString }, selectedBooks);

        // Reset form
        setEventName('');
        setDateRange([null, null]);
        setSelectedBookCodes(new Set());
    };

    const isCreatingEvent = eventName.trim() !== '' || startDate !== null;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-2 text-gray-500">Loading books...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Admin Access</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage learning resources and create evaluation events.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => fetchBooks()}
                            disabled={isLoading}
                            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors disabled:opacity-50"
                            title="Refresh data"
                        >
                            <RefreshIcon className={`h-5 w-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={onAddBook}
                            className="flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Add New Book
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                        <label htmlFor="event-name" className="block text-sm font-medium text-gray-700 mb-1">
                            Event Name <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <input
                            id="event-name"
                            type="text"
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                            placeholder="e.g., Q4 Science Textbook Evaluation"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label htmlFor="event-date" className="block text-sm font-medium text-gray-700 mb-1">
                            Event Date Range <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <div className="relative">
                            <DatePicker
                                selectsRange={true}
                                startDate={startDate}
                                endDate={endDate}
                                onChange={(update) => {
                                    setDateRange(update);
                                }}
                                isClearable={true}
                                placeholderText="Select date range"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all pl-10"
                                wrapperClassName="w-full"
                                popperClassName="!z-50"
                            />
                            <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Select Materials</h3>
                        <p className="text-sm text-gray-500">Choose books to include in this evaluation event.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <select
                            value={learningAreaFilter}
                            onChange={(e) => setLearningAreaFilter(e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">All Learning Areas</option>
                            {learningAreas.map(area => (
                                <option key={area} value={area}>{area}</option>
                            ))}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">All Statuses</option>
                            {statuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                        <div className="relative flex-1 sm:w-64">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-gray-400" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search books..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto max-h-[600px]">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-center w-12">
                                        <div className="flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={(() => {
                                                    const selectableBooks = filteredBooks.filter(b => b.bookCode && !existingBookCodes.has(b.bookCode));
                                                    return selectableBooks.length > 0 && selectedBookCodes.size === selectableBooks.length;
                                                })()}
                                                onChange={handleSelectAll}
                                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                                            />
                                        </div>
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('bookCode')}
                                    >
                                        Book Code {sortConfig.key === 'bookCode' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('title')}
                                    >
                                        Title {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('publisher')}
                                    >
                                        Publisher {sortConfig.key === 'publisher' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('learningArea')}
                                    >
                                        Learning Area {sortConfig.key === 'learningArea' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('gradeLevel')}
                                    >
                                        Grade {sortConfig.key === 'gradeLevel' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('status')}
                                    >
                                        Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredBooks.map((book, index) => {
                                    const isAlreadyInMonitoring = book.bookCode ? existingBookCodes.has(book.bookCode) : false;
                                    return (
                                        <tr
                                            key={book.bookCode || `book-${index}`}
                                            className={`${isAlreadyInMonitoring ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'} transition-colors`}
                                        >
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={book.bookCode ? selectedBookCodes.has(book.bookCode) : false}
                                                        onChange={() => book.bookCode && handleToggleSelect(book.bookCode)}
                                                        disabled={isAlreadyInMonitoring || !book.bookCode}
                                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50 cursor-pointer"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{book.bookCode}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate" title={book.title}>{book.title}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{book.publisher}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{book.learningArea}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{book.gradeLevel}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                                                {isAlreadyInMonitoring ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Monitored
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        Available
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => onEditBook(book)}
                                                        className="text-gray-400 hover:text-primary-600 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <EditIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => onDeleteBook(book.bookCode)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <DeleteIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredBooks.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                            No books found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                    onClick={handleSubmit}
                    disabled={selectedBookCodes.size === 0}
                    className={`flex items-center justify-center px-6 py-3 rounded-lg font-bold text-white shadow-sm transition-all transform active:scale-95 ${selectedBookCodes.size > 0
                        ? 'bg-primary-600 hover:bg-primary-700 hover:shadow-md'
                        : 'bg-gray-300 cursor-not-allowed'
                        }`}
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    {isCreatingEvent ? 'Create Evaluation Event' : 'Add to Monitoring'}
                </button>
            </div>
        </div>
    );
};
