import React, { useState } from 'react';
import { Book, SortConfig, Status } from '../types';
import { SortIcon, FilterIcon, EditIcon, DeleteIcon, HistoryIcon, AddRemarkIcon } from './Icons';
import { StatusPill } from './StatusPill';
import { StatusDropdown } from './StatusDropdown';
import { StatusFilterDropdown } from './StatusFilterDropdown';

interface DataTableProps {
  books: Book[];
  sortConfig: SortConfig<Book>;
  setSortConfig: React.Dispatch<React.SetStateAction<SortConfig<Book>>>;
  filters: Partial<Record<keyof Book, any>>;
  setFilters: React.Dispatch<React.SetStateAction<Partial<Record<keyof Book, any>>>>;
  onEdit: (book: Book) => void;
  onDelete: (bookCode: string) => void;
  onUpdate: (book: Book) => void;
  onOpenAddRemarkModal: (book: Book) => void;
  onViewRemarks: (book: Book) => void;
  deletingBookCode: string | null;
  headerOffset?: number;
}

const columns: { key: keyof Book; label: string; sortable: boolean }[] = [
  { key: 'bookCode', label: 'Book Code', sortable: true },
  { key: 'learningArea', label: 'Learning Area', sortable: true },
  { key: 'gradeLevel', label: 'Grade Level', sortable: true },
  { key: 'publisher', label: 'Publisher', sortable: true },
  { key: 'title', label: 'Titles', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'remarks', label: 'Remarks', sortable: true },
];

export const DataTable: React.FC<DataTableProps> = ({ books, sortConfig, setSortConfig, filters, setFilters, onEdit, onDelete, onUpdate, onOpenAddRemarkModal, onViewRemarks, deletingBookCode, headerOffset = 0 }) => {

  const [editingStatusBookCode, setEditingStatusBookCode] = useState<string | null>(null);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Detect mobile view
  React.useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const requestSort = (key: keyof Book) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (key: keyof Book, value: string | Status[]) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      // Remove empty filters
      if (!value || (Array.isArray(value) && value.length === 0) || value === '') {
        delete newFilters[key];
      }
      return newFilters;
    });
  };

  const handleStatusChange = (book: Book, newStatus: Status) => {
    onUpdate({ ...book, status: newStatus });
  };

  // Mobile card view
  if (isMobileView) {
    return (
      <div className="divide-y divide-gray-200">
        {books.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No books found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          books.map((book) => (
            <div key={book.bookCode} className={`p-4 ${book.isNew ? 'bg-primary-50/30' : 'bg-white'} ${deletingBookCode === book.bookCode ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-base mb-1">{book.title}</h3>
                  <p className="text-xs text-gray-500 font-mono">{book.bookCode}</p>
                </div>
                <div className="flex gap-2 ml-2">
                  <button
                    onClick={() => onEdit(book)}
                    className="text-gray-400 hover:text-primary-600 transition-colors p-2 rounded-md hover:bg-primary-50"
                    title="Edit"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => onDelete(book.bookCode)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-md hover:bg-red-50"
                    title="Delete"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Learning Area:</span>
                  <span className="text-gray-900 font-medium">{book.learningArea}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Grade Level:</span>
                  <span className="text-gray-900 font-medium">{book.gradeLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Publisher:</span>
                  <span className="text-gray-900 font-medium">{book.publisher}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status:</span>
                  <button onClick={() => setEditingStatusBookCode(book.bookCode)} className="focus:outline-none">
                    <StatusPill status={book.status} />
                  </button>
                  {editingStatusBookCode === book.bookCode && (
                    <StatusDropdown
                      currentStatus={book.status}
                      onStatusChange={(newStatus) => {
                        handleStatusChange(book, newStatus);
                        setEditingStatusBookCode(null);
                      }}
                      onClose={() => setEditingStatusBookCode(null)}
                    />
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Latest Remark:</p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {book.remarks[0]?.text || <span className="text-gray-400 italic">No remarks</span>}
                    </p>
                    {book.remarks[0]?.createdBy && (
                      <p className="text-xs text-gray-400 mt-1">by {book.remarks[0].createdBy}</p>
                    )}
                  </div>
                  <button
                    onClick={() => onOpenAddRemarkModal(book)}
                    className="text-primary-600 hover:text-primary-800 flex-shrink-0 p-1 rounded-full hover:bg-primary-50 transition-colors"
                    title="Add new remark"
                  >
                    <AddRemarkIcon />
                  </button>
                </div>
                {book.remarks.length > 0 && (
                  <button onClick={() => onViewRemarks(book)} className="mt-2 flex items-center text-xs text-primary-600 hover:text-primary-800 font-medium">
                    <HistoryIcon className="h-3 w-3 mr-1" />
                    View History ({book.remarks.length})
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="overflow-x-auto max-h-[calc(100vh-400px)] min-h-[400px]">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(({ key, label, sortable }) => (
              <th
                key={key}
                scope="col"
                style={{ top: 0 }}
                className={`px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider sticky bg-gray-50/95 backdrop-blur-sm border-b border-gray-200 ${key === 'bookCode' ? 'left-0 z-40 min-w-[120px] lg:min-w-[140px]' :
                  key === 'publisher' ? 'min-w-[180px] lg:min-w-[200px] z-30' :
                    key === 'title' ? 'min-w-[220px] lg:min-w-[250px] z-30' :
                      key === 'status' ? 'min-w-[160px] lg:min-w-[180px] z-30' :
                        key === 'remarks' ? 'min-w-[250px] lg:min-w-[280px] z-30' :
                          key === 'learningArea' ? 'min-w-[140px] lg:min-w-[150px] z-30' :
                            'min-w-[100px] lg:min-w-[120px] z-30'
                  }`}
              >
                <div className="flex items-center justify-center group mb-3">
                  {sortable ? (
                    <button onClick={() => requestSort(key)} className="flex items-center focus:outline-none hover:text-gray-700 transition-colors">
                      <span className="text-xs lg:text-xs">{label}</span>
                      <SortIcon className="ml-1 lg:ml-2 h-3 w-3 lg:h-4 lg:w-4 text-gray-400" direction={sortConfig.key === key ? sortConfig.direction : undefined} />
                    </button>
                  ) : (
                    <span className="text-xs lg:text-xs">{label}</span>
                  )}
                </div>
                <div className="mt-1">
                  {key === 'status' ? (
                    <div className="relative">
                      <button
                        onClick={() => setIsStatusFilterOpen(prev => !prev)}
                        className="w-full min-w-[140px] lg:min-w-[160px] text-gray-600 px-2 lg:px-3 py-1.5 lg:py-2 border border-gray-300 rounded-md bg-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-left shadow-sm hover:border-gray-400 transition-colors"
                      >
                        <span className="block truncate">
                          {filters.status && Array.isArray(filters.status) && filters.status.length > 0
                            ? `${filters.status.length} selected`
                            : 'Filter Status'
                          }
                        </span>
                      </button>
                      {isStatusFilterOpen && (
                        <StatusFilterDropdown
                          selectedStatuses={(filters.status as Status[]) || []}
                          onChange={(selected) => handleFilterChange('status', selected)}
                          onClose={() => setIsStatusFilterOpen(false)}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Filter..."
                        value={filters[key] || ''}
                        onChange={(e) => handleFilterChange(key, e.target.value)}
                        className="w-full text-gray-600 px-2 lg:px-3 py-1.5 lg:py-2 pr-7 lg:pr-8 border border-gray-300 rounded-md bg-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm hover:border-gray-400 transition-colors"
                      />
                      <FilterIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                    </div>
                  )}
                </div>
              </th>
            ))}
            <th scope="col" style={{ top: 0 }} className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider sticky z-30 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200 min-w-[90px] lg:min-w-[100px]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {books.map((book) => (
            <tr key={book.bookCode} className={`group transition-all duration-200 ${deletingBookCode === book.bookCode ? 'opacity-0' : 'opacity-100'} ${book.isNew ? 'bg-primary-50/50' : ''} hover:bg-gray-50/80`}>
              {columns.map(col => (
                <td
                  key={col.key}
                  className={`px-6 py-4 text-sm text-gray-700 align-top ${col.key === 'title' || col.key === 'remarks' ? '' : 'whitespace-nowrap'
                    } ${col.key === 'bookCode'
                      ? `sticky left-0 z-10 ${book.isNew ? 'bg-primary-50/50' : 'bg-white'} group-hover:bg-gray-50/80`
                      : ''
                    }`}
                >
                  {(() => {
                    if (col.key === 'status') {
                      return (
                        <div className="relative">
                          <button onClick={() => setEditingStatusBookCode(book.bookCode)} className="focus:outline-none transform transition-transform active:scale-95">
                            <StatusPill status={book.status} />
                          </button>
                          {editingStatusBookCode === book.bookCode && (
                            <StatusDropdown
                              currentStatus={book.status}
                              onStatusChange={(newStatus) => {
                                handleStatusChange(book, newStatus);
                                setEditingStatusBookCode(null);
                              }}
                              onClose={() => setEditingStatusBookCode(null)}
                            />
                          )}
                        </div>
                      );
                    }
                    if (col.key === 'remarks') {
                      const latestRemark = book.remarks[0];
                      return (
                        <div className="max-w-sm">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-grow min-h-[20px] overflow-hidden">
                              <div className="line-clamp-2 text-gray-600 text-sm" title={latestRemark?.text}>
                                {latestRemark?.text || <span className="text-gray-400 italic">No remarks</span>}
                              </div>
                              {latestRemark?.createdBy && (
                                <div className="text-xs text-gray-400 mt-1">
                                  by {latestRemark.createdBy}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => onOpenAddRemarkModal(book)}
                              className="text-primary-600 hover:text-primary-800 flex-shrink-0 p-1 rounded-full hover:bg-primary-50 transition-colors"
                              title="Add new remark"
                            >
                              <AddRemarkIcon />
                            </button>
                          </div>
                          {book.remarks.length > 0 && (
                            <button onClick={() => onViewRemarks(book)} className="mt-2 flex items-center text-xs text-primary-600 hover:text-primary-800 font-medium">
                              <HistoryIcon className="h-3 w-3 mr-1" />
                              History ({book.remarks.length})
                            </button>
                          )}
                        </div>
                      );
                    }
                    if (col.key === 'title') {
                      return <span className="font-medium text-gray-900 block max-w-sm">{book.title}</span>
                    }
                    return <span className="text-gray-600">{book[col.key]}</span>;
                  })()}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => onEdit(book)}
                    className="text-gray-400 hover:text-primary-600 transition-colors p-2 rounded-lg hover:bg-primary-50"
                    title="Edit"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => onDelete(book.bookCode)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                    title="Delete"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {books.length === 0 && (
        <div className="text-center py-12 px-4">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No books found</h3>
          <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};