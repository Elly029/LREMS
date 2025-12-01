
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Book, SortConfig, Remark, Status } from './types';
import { DataTable } from './components/DataTable';
import { BookFormModal } from './components/BookFormModal';
import { AddRemarkModal } from './components/AddRemarkModal';
import { PlusIcon, SearchIcon } from './components/Icons';
import { useDebounce } from './hooks/useDebounce';
import { Toast } from './components/Toast';
import { RemarkHistoryModal } from './components/RemarkHistoryModal';
import { bookApi } from './services/bookService';
import { monitoringApi } from './services/monitoringService';
import { Layout } from './components/Layout';
import { EvaluatorsList } from './components/EvaluatorsList';
import { ExportButtons } from './components/ExportButtons';
import { LoginPage } from './components/LoginPage';
import { apiClient } from './services/api';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { MonitoringTable } from './components/MonitoringTable';


import { CreateEvaluationEvent } from './components/CreateEvaluationEvent';
import { CreateEvaluatorModal } from './components/CreateEvaluatorModal';
import { evaluatorService, EvaluatorProfile } from './services/evaluatorService';
import { EvaluatorDashboard } from './components/EvaluatorDashboard';
import { AddToMonitoringModal } from './components/AddToMonitoringModal';
import { ChatPanel, ChatButton } from './components/Chat';

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
  is_admin_access?: boolean;
  evaluator_id?: string;
}

const App: React.FC = () => {
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isEvaluatorModalOpen, setIsEvaluatorModalOpen] = useState(false);
  const [editingEvaluator, setEditingEvaluator] = useState<EvaluatorProfile | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'inventory' | 'monitoring' | 'admin' | 'create-evaluation' | 'evaluators' | 'evaluator-dashboard'>('inventory');

  // Tour handler reference
  const evaluatorTourStartRef = useRef<(() => void) | null>(null);

  // Restore user session from localStorage on app initialization
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        apiClient.setToken(parsedUser.token);

        // Set initial view based on role
        if (parsedUser.evaluator_id && !parsedUser.is_admin_access) {
          setCurrentView('evaluator-dashboard');
        }
      } catch (error) {
        console.error('Failed to restore user session', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Handle login
  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await apiClient.post<User>('/auth/login', { username, password });
      setUser(response);
      apiClient.setToken(response.token);
      // Persist to localStorage
      localStorage.setItem('user', JSON.stringify(response));

      // Redirect to Evaluator Dashboard if user is an evaluator and not admin
      if (response.evaluator_id && !response.is_admin_access) {
        setCurrentView('evaluator-dashboard');
      } else {
        setCurrentView('inventory');
      }
    } catch (error: any) {
      console.error('Login failed', error);
      alert(error.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    setUser(null);
    apiClient.setToken(null);
    // Clear from localStorage
    localStorage.removeItem('user');
  };

  // Data state
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI state with persistence
  const [filters, setFilters] = useState<Partial<Record<keyof Book, string | Status[]>>>(() => {
    try {
      const savedFilters = sessionStorage.getItem('bookFilters');
      return savedFilters ? JSON.parse(savedFilters) : {};
    } catch {
      return {};
    }
  });
  const [sortConfig, setSortConfig] = useState<SortConfig<Book>>(() => {
    try {
      const savedSort = sessionStorage.getItem('bookSort');
      return savedSort ? JSON.parse(savedSort) : { key: 'bookCode', direction: 'ascending' };
    } catch {
      return { key: 'bookCode', direction: 'ascending' };
    }
  });

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const [isRemarkHistoryModalOpen, setIsRemarkHistoryModalOpen] = useState(false);
  const [selectedBookForRemarks, setSelectedBookForRemarks] = useState<Book | null>(null);

  const [isAddRemarkModalOpen, setIsAddRemarkModalOpen] = useState(false);
  const [bookForNewRemark, setBookForNewRemark] = useState<Book | null>(null);

  const [searchTerm, setSearchTerm] = useState(() => {
    try {
      return sessionStorage.getItem('bookSearch') || '';
    } catch {
      return '';
    }
  });
  const debouncedSearchTerm = useDebounce(searchTerm, 1000); // Increased from 300ms to 1000ms

  const [isFiltering, setIsFiltering] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deletingBookCode, setDeletingBookCode] = useState<string | null>(null);
  const [dataVersion, setDataVersion] = useState(0);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  // Fetch books from API
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await bookApi.fetchBooks();
      setBooks(result.books);
    } catch (err: any) {
      console.error('Error fetching books:', err);
      setError(err.message || 'Failed to load books');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch books on mount and when dataVersion changes
  useEffect(() => {
    if (user && currentView === 'inventory') {
      fetchBooks();
    }
  }, [user, currentView, dataVersion, fetchBooks]);

  const handleOpenAddModal = () => {
    setEditingBook(null);
    setIsBookModalOpen(true);
  };

  const handleOpenEditModal = (book: Book) => {
    setEditingBook(book);
    setIsBookModalOpen(true);
  };

  const handleCloseBookModal = () => {
    setIsBookModalOpen(false);
    setEditingBook(null);
  };

  const handleSaveBook = async (bookData: Omit<Book, 'remarks' | 'bookCode'> & { remark: string; bookCode?: string }) => {
    try {
      if (editingBook) {
        const { remark, ...bookToUpdate } = bookData;
        await bookApi.updateBook(editingBook.bookCode, bookToUpdate);
        if (remark) {
          await bookApi.addRemark(editingBook.bookCode, { text: remark, timestamp: new Date().toISOString() });
        }
        showToast('Book updated successfully!', 'success');
      } else {
        const newBook = await bookApi.createBook(bookData);
        if (bookData.remark) {
          await bookApi.addRemark(newBook.bookCode, { text: bookData.remark, timestamp: new Date().toISOString() });
        }
        showToast('Book added successfully!', 'success');
      }
      setDataVersion(prev => prev + 1);
      handleCloseBookModal();
    } catch (err) {
      showToast('Failed to save book', 'error');
    }
  };

  const handleDeleteBook = useCallback(async (bookCode: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      setDeletingBookCode(bookCode);
      try {
        await bookApi.deleteBook(bookCode);
        setDeletingBookCode(null);
        setDataVersion(prev => prev + 1);
        showToast('Book deleted successfully.', 'success');
      } catch (err) {
        setDeletingBookCode(null);
        showToast('Failed to delete book', 'error');
      }
    }
  }, []);

  const handleUpdateBook = useCallback(async (updatedBook: Book) => {
    try {
      await bookApi.updateBook(updatedBook.bookCode, updatedBook);
      showToast('Book updated successfully!', 'success');
      setDataVersion(prev => prev + 1);
    } catch (err) {
      showToast('Failed to update book', 'error');
    }
  }, []);

  const handleAddRemark = async (bookCode: string, remark: Remark) => {
    try {
      await bookApi.addRemark(bookCode, remark);
      showToast('Remark added successfully!', 'success');
      setIsAddRemarkModalOpen(false);
      setBookForNewRemark(null);
      // Refresh the books to show updated remark
      await fetchBooks();
    } catch (err) {
      showToast('Failed to add remark', 'error');
    }
  };

  const handleSaveEditedRemark = async (bookCode: string, remarkId: string, remark: Remark) => {
    try {
      await bookApi.updateRemark(bookCode, remarkId, remark);
      showToast('Remark updated successfully!', 'success');

      // Refresh the books to show updated remark
      await fetchBooks();
    } catch (err) {
      showToast('Failed to update remark', 'error');
    }
  };



  // Evaluator handlers
  const handleOpenEvaluatorModal = (evaluator?: EvaluatorProfile) => {
    setEditingEvaluator(evaluator || null);
    setIsEvaluatorModalOpen(true);
  };

  const handleSaveEvaluator = async (evaluatorData: Omit<EvaluatorProfile, '_id'>) => {
    try {
      if (editingEvaluator && editingEvaluator._id) {
        await evaluatorService.updateEvaluator(editingEvaluator._id, evaluatorData);
        showToast('Evaluator updated successfully!', 'success');
      } else {
        await evaluatorService.createEvaluator(evaluatorData);
        showToast('Evaluator created successfully!', 'success');
      }
      setIsEvaluatorModalOpen(false);
      setEditingEvaluator(null);
    } catch (err) {
      showToast('Failed to save evaluator', 'error');
    }
  };

  const handleDeleteEvaluator = async (id: string) => {
    try {
      const success = await evaluatorService.deleteEvaluator(id);
      if (success) {
        showToast('Evaluator deleted successfully!', 'success');
      } else {
        showToast('Failed to delete evaluator', 'error');
      }
    } catch (err) {
      showToast('Failed to delete evaluator', 'error');
    }
  };

  const handleUpdateEventName = async (oldEventName: string, newEventName: string) => {
    try {
      // Update all monitoring items that have the old event name
      const itemsToUpdate = monitoringData.filter(item => item.eventName === oldEventName);

      // Update each item via the backend
      await Promise.all(
        itemsToUpdate.map(item =>
          monitoringApi.update(item.bookCode, { ...item, eventName: newEventName })
        )
      );

      // Refresh monitoring data to show updates
      await fetchMonitoringData();
      showToast(`Event name updated successfully! (${itemsToUpdate.length} book${itemsToUpdate.length !== 1 ? 's' : ''} updated)`, 'success');
    } catch (err: any) {
      console.error('Error updating event name:', err);
      showToast(err.message || 'Failed to update event name', 'error');
    }
  };

  const handleAddBooksToMonitoring = async (selectedBooks: Book[], eventName?: string, eventDate?: string) => {
    try {
      const newMonitoringItems = selectedBooks.map(book => ({
        bookCode: book.bookCode,
        learningArea: book.learningArea,
        evaluators: [],
        eventName: eventName || undefined,
        eventDate: eventDate || undefined,
      }));

      const result = await monitoringApi.bulkCreate(newMonitoringItems);

      if (eventName || eventDate) {
        showToast(`${result.results.length} book${result.results.length !== 1 ? 's' : ''} added to "${eventName}"!`, 'success');
      } else {
        showToast(`${result.results.length} book${result.results.length !== 1 ? 's' : ''} added to monitoring!`, 'success');
      }

      if (result.errors.length > 0) {
        console.warn('Some books failed to add:', result.errors);
      }

      // Refresh monitoring data
      await fetchMonitoringData();
    } catch (err: any) {
      console.error('Error adding books to monitoring:', err);
      showToast(err.message || 'Failed to add books to monitoring', 'error');
    }
  };

  const handleOpenAddRemarkModal = (book: Book) => {
    setBookForNewRemark(book);
    setIsAddRemarkModalOpen(true);
  };

  const handleViewRemarks = (book: Book) => {
    setSelectedBookForRemarks(book);
    setIsRemarkHistoryModalOpen(true);
  };

  // Sync selectedBookForRemarks with updated books data
  useEffect(() => {
    if (selectedBookForRemarks) {
      const updatedBook = books.find(b => b.bookCode === selectedBookForRemarks.bookCode);
      if (updatedBook && updatedBook !== selectedBookForRemarks) {
        setSelectedBookForRemarks(updatedBook);
      }
    }
  }, [books, selectedBookForRemarks]);

  const filteredBooks = useMemo(() => {
    setIsFiltering(true);
    let filtered = books;

    if (debouncedSearchTerm) {
      const lowercasedTerm = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(book =>
        Object.values(book).some(value => {
          if (Array.isArray(value)) { // Specifically for remarks
            return value.some(remark => remark.text.toLowerCase().includes(lowercasedTerm));
          }
          return String(value).toLowerCase().includes(lowercasedTerm)
        })
      );
    }

    const result = filtered.filter(book => {
      return (Object.keys(filters) as Array<keyof Book>).every(key => {
        const filterValue = filters[key];
        if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) return true;

        if (key === 'status' && Array.isArray(filterValue)) {
          return filterValue.includes(book.status);
        }

        if (typeof filterValue === 'string') {
          const normalizedFilter = filterValue.trim().toLowerCase();
          if (!normalizedFilter) return true; // Handle empty string after trim

          if (key === 'remarks') {
            return book.remarks?.some(r => r.text.toLowerCase().includes(normalizedFilter)) ?? false;
          }

          const bookValue = book[key];

          if (typeof bookValue === 'string') {
            return bookValue.toLowerCase().includes(normalizedFilter);
          }
          if (typeof bookValue === 'number') {
            return bookValue.toString().includes(normalizedFilter);
          }

          // If filter is active but value is null/undefined/mismatch, exclude it
          return false;
        }
        return true;
      });
    });

    setTimeout(() => setIsFiltering(false), 100);
    return result;
  }, [books, filters, debouncedSearchTerm]);

  const sortedBooks = useMemo(() => {
    const sorted = [...filteredBooks];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Handle remarks array for sorting (sort by latest remark)
        if (sortConfig.key === 'remarks') {
          const aRemark = a.remarks[0]?.text || '';
          const bRemark = b.remarks[0]?.text || '';
          if (aRemark < bRemark) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (aRemark > bRemark) return sortConfig.direction === 'ascending' ? 1 : -1;
          return 0;
        }

        // Handle defined values
        if (aValue !== undefined && bValue !== undefined) {
          if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        }

        return 0;
      });
    }

    const bookCodes = sorted.map(b => b.bookCode);
    const uniqueBookCodes = new Set(bookCodes);
    if (bookCodes.length !== uniqueBookCodes.size) {
      console.error('⚠️ DUPLICATE BOOK CODES FOUND!', {
        allCodes: bookCodes,
        uniqueCodes: Array.from(uniqueBookCodes)
      });
    }

    return sorted;
  }, [filteredBooks, sortConfig, deletingBookCode]);

  // Clear all filters handler
  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
    sessionStorage.removeItem('bookFilters');
    sessionStorage.removeItem('bookSearch');
  };

  // Dashboard stats - responsive to filters
  const totalBooksCount = books.length;
  const totalPublishersCount = useMemo(() => new Set(books.map(b => b.publisher).filter(Boolean)).size, [books]);
  const totalLearningAreasCount = useMemo(() => new Set(books.map(b => b.learningArea).filter(Boolean)).size, [books]);

  const filteredBooksCount = filteredBooks.length;
  const filteredPublishersCount = useMemo(() => new Set(filteredBooks.map(b => b.publisher).filter(Boolean)).size, [filteredBooks]);
  const filteredLearningAreasCount = useMemo(() => new Set(filteredBooks.map(b => b.learningArea).filter(Boolean)).size, [filteredBooks]);

  const isFiltered = filteredBooksCount < totalBooksCount;

  // Monitoring state
  const [monitoringData, setMonitoringData] = useState<import('./types').EvaluatorMonitoring[]>([]);
  const [monitoringLoading, setMonitoringLoading] = useState(false);
  const [isAddToMonitoringModalOpen, setIsAddToMonitoringModalOpen] = useState(false);

  // Fetch monitoring data
  const fetchMonitoringData = async () => {
    if (!user) return;

    setMonitoringLoading(true);
    try {
      const data = await monitoringApi.fetchAll();
      setMonitoringData(data);
    } catch (err) {
      console.error('Error fetching monitoring data:', err);
      showToast('Failed to load monitoring data', 'error');
    } finally {
      setMonitoringLoading(false);
    }
  };

  // Load monitoring data when user logs in or view changes to monitoring
  useEffect(() => {
    if (user && currentView === 'monitoring') {
      fetchMonitoringData();
    }
  }, [user, currentView]);

  const filteredMonitoringData = useMemo(() => {
    if (!user) return [];
    if (user.is_admin_access) return monitoringData;

    return monitoringData.filter(item => {
      // If user is an evaluator, only show items where they are assigned
      if (user.evaluator_id) {
        // Check if the evaluator's ID is in the item's evaluators list
        // Note: item.evaluators contains objects with _id or just strings depending on population
        // We need to check against the evaluator ID
        return item.evaluators.some((e: any) =>
          (typeof e === 'string' && e === user.evaluator_id) ||
          (typeof e === 'object' && e._id === user.evaluator_id)
        );
      }

      // Fallback for other users (access rules)
      if (!user.access_rules || user.access_rules.length === 0) return false;

      return user.access_rules.some(rule => {
        const areaMatch = rule.learning_areas.includes('*') || rule.learning_areas.includes(item.learningArea);
        return areaMatch;
      });
    });
  }, [monitoringData, user]);

  const handleUpdateMonitoring = async (updatedItem: import('./types').EvaluatorMonitoring) => {
    try {
      // Find the original book code (in case it changed)
      const originalItem = monitoringData.find(m =>
        m.bookCode === updatedItem.bookCode ||
        m.evaluators === updatedItem.evaluators
      );

      const bookCodeToUpdate = originalItem?.bookCode || updatedItem.bookCode;

      await monitoringApi.update(bookCodeToUpdate, updatedItem);

      // Refresh monitoring data
      await fetchMonitoringData();
      showToast('Monitoring entry updated successfully!', 'success');
    } catch (err: any) {
      console.error('Error updating monitoring entry:', err);
      showToast(err.message || 'Failed to update monitoring entry', 'error');
    }
  };

  const handleRemoveFromMonitoring = async (bookCode: string) => {
    try {
      await monitoringApi.delete(bookCode);

      // Refresh monitoring data
      await fetchMonitoringData();
      showToast('Book removed from monitoring successfully!', 'success');
    } catch (err: any) {
      console.error('Error removing monitoring entry:', err);
      showToast(err.message || 'Failed to remove monitoring entry', 'error');
    }
  };






  const handleCreateEvaluation = async (eventDetails: { name?: string; date?: string }, selectedBooks: Book[]) => {
    try {
      const newMonitoringItems = selectedBooks.map(book => ({
        bookCode: book.bookCode,
        learningArea: book.learningArea,
        evaluators: [],
        eventName: eventDetails.name || undefined,
        eventDate: eventDetails.date || undefined,
      }));

      const result = await monitoringApi.bulkCreate(newMonitoringItems);

      if (eventDetails.name || eventDetails.date) {
        showToast(`Evaluation event created with ${result.results.length} book${result.results.length !== 1 ? 's' : ''}!`, 'success');
      } else {
        showToast(`${result.results.length} book${result.results.length !== 1 ? 's' : ''} added to monitoring!`, 'success');
      }

      if (result.errors.length > 0) {
        console.warn('Some books failed to add:', result.errors);
      }

      setCurrentView('monitoring'); // Switch to monitoring view to see the new items
    } catch (err: any) {
      console.error('Error creating evaluation:', err);
      showToast(err.message || 'Failed to create evaluation', 'error');
    }
  };

  // Sticky header logic removed as per request
  // The table headers will now stick to the main navigation bar (approx 64px)

  // If not authenticated, show login page
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Layout
      user={user}
      onLogout={handleLogout}
      onChangePassword={() => setIsChangePasswordModalOpen(true)}
      currentView={currentView}
      onViewChange={setCurrentView}
      onStartEvaluatorTour={() => evaluatorTourStartRef.current?.()}
    >
      {currentView === 'inventory' ? (
        <div className="space-y-6">
          {/* Dashboard Stats & Controls - No longer sticky */}
          <div className="bg-gray-50 pt-3 pb-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 shadow-sm">
            {/* Dashboard Summary */}
            <div id="dashboard-stats" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="card p-5">
                <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Books</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary-600">{filteredBooksCount}</span>
                  <span className="text-sm text-gray-500 font-medium">records</span>
                </div>
                {isFiltered && (
                  <div className="mt-2 text-xs text-gray-400 font-medium">
                    of {totalBooksCount} total
                  </div>
                )}
              </div>
              <div className="card p-5">
                <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Publishers</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary-600">{filteredPublishersCount}</span>
                  <span className="text-sm text-gray-500 font-medium">unique</span>
                </div>
                {isFiltered && (
                  <div className="mt-2 text-xs text-gray-400 font-medium">
                    of {totalPublishersCount} total
                  </div>
                )}
              </div>
              <div className="card p-5">
                <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Learning Areas</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary-600">{filteredLearningAreasCount}</span>
                  <span className="text-sm text-gray-500 font-medium">subjects</span>
                </div>
                {isFiltered && (
                  <div className="mt-2 text-xs text-gray-400 font-medium">
                    of {totalLearningAreasCount} total
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                <div id="search-bar" className="relative w-full sm:flex-1 sm:max-w-lg">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by title, code, or remarks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm text-sm transition-all duration-200"
                  />
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div id="export-buttons" className="hidden sm:block">
                    <ExportButtons books={books} />
                  </div>
                  <button
                    id="add-book-btn"
                    onClick={handleOpenAddModal}
                    className="btn btn-primary whitespace-nowrap py-2.5"
                  >
                    <PlusIcon />
                    <span className="ml-2">Add New Book</span>
                  </button>
                </div>
              </div>

              {/* Active Filters Display */}
              {
                (Object.keys(filters).some(key => {
                  const val = filters[key as keyof Book];
                  return val && (Array.isArray(val) ? val.length > 0 : val !== '');
                }) || searchTerm) && (
                  <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-xs font-medium text-gray-500">Active Filters:</span>
                    {searchTerm && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-md">
                        Search: "{searchTerm}"
                        <button onClick={() => setSearchTerm('')} className="hover:text-primary-900">×</button>
                      </span>
                    )}
                    {Object.entries(filters).map(([key, value]) => {
                      if (!value || (Array.isArray(value) && value.length === 0)) return null;
                      const displayValue = Array.isArray(value) ? `${value.length} selected` : value;
                      return (
                        <span key={key} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                          {key}: {displayValue}
                          <button onClick={() => setFilters(prev => ({ ...prev, [key]: Array.isArray(value) ? [] : '' }))} className="hover:text-gray-900">×</button>
                        </span>
                      );
                    })}
                    <button
                      onClick={handleClearFilters}
                      className="ml-auto text-xs text-red-600 hover:text-red-700 font-medium hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                )
              }
            </div >
          </div >

          {/* Main Content */}
          <div id="data-table" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
            {loading && (
              <div className="flex flex-col justify-center items-center h-64 p-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-4"></div>
                <span className="text-gray-500 font-medium text-center">Loading your library...</span>
              </div>
            )}

            {
              error && !loading && (
                <div className="p-4 sm:p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                    <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load books</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">{error}</p>
                  <button
                    onClick={fetchBooks}
                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )
            }

            {
              !loading && !error && (
                <>
                  {isFiltering && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  )}
                  <DataTable
                    books={sortedBooks}
                    sortConfig={sortConfig}
                    setSortConfig={setSortConfig}
                    filters={filters}
                    setFilters={setFilters}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteBook}
                    onUpdate={handleUpdateBook}
                    onOpenAddRemarkModal={handleOpenAddRemarkModal}
                    onViewRemarks={handleViewRemarks}
                    deletingBookCode={deletingBookCode}
                    headerOffset={64} // Fixed offset for main nav height
                  />
                </>
              )
            }
          </div>
        </div>
      ) : currentView === 'monitoring' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Evaluation Monitoring</h2>
            {user?.is_admin_access && (
              <button
                onClick={() => setIsAddToMonitoringModalOpen(true)}
                className="flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors"
              >
                <PlusIcon />
                <span className="ml-2">Add Books to Monitoring</span>
              </button>
            )}
          </div>
          <MonitoringTable
            data={filteredMonitoringData}
            headerOffset={64}
            onUpdate={handleUpdateMonitoring}
            onRemove={handleRemoveFromMonitoring}
            allBooks={books}
            user={user || undefined}
            onViewRemarks={handleViewRemarks}
            onAddRemark={handleOpenAddRemarkModal}
            onUpdateEventName={handleUpdateEventName}
          />
        </div>
      ) : currentView === 'evaluators' ? (
        <EvaluatorsList
          onEdit={handleOpenEvaluatorModal}
          onDelete={handleDeleteEvaluator}
          onCreate={() => handleOpenEvaluatorModal()}
          user={user}
        />
      ) : currentView === 'evaluator-dashboard' ? (
        <EvaluatorDashboard user={user} onTourStart={(startTour) => { evaluatorTourStartRef.current = startTour; }} />
      ) : (
        <div className="space-y-6">
          <CreateEvaluationEvent
            existingBookCodes={new Set(monitoringData.map(m => m.bookCode))}
            onCreateEvent={handleCreateEvaluation}
            onAddBook={handleOpenAddModal}
            onEditBook={handleOpenEditModal}
            onDeleteBook={handleDeleteBook}
            dataVersion={dataVersion}
          />
        </div>
      )}

      {/* Modals */}
      <BookFormModal
        isOpen={isBookModalOpen}
        onClose={handleCloseBookModal}
        onSave={handleSaveBook}
        book={editingBook}
      />
      <RemarkHistoryModal
        isOpen={isRemarkHistoryModalOpen}
        onClose={() => setIsRemarkHistoryModalOpen(false)}
        book={selectedBookForRemarks}
        onDataChange={fetchBooks}
        onAddRemark={() => selectedBookForRemarks && handleOpenAddRemarkModal(selectedBookForRemarks)}
      />
      <AddRemarkModal
        isOpen={isAddRemarkModalOpen}
        onClose={() => setIsAddRemarkModalOpen(false)}
        book={bookForNewRemark}
        onAddRemark={handleAddRemark}
      />
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
      <CreateEvaluatorModal
        isOpen={isEvaluatorModalOpen}
        onClose={() => {
          setIsEvaluatorModalOpen(false);
          setEditingEvaluator(null);
        }}
        onSave={handleSaveEvaluator}
        evaluator={editingEvaluator}
      />
      <AddToMonitoringModal
        isOpen={isAddToMonitoringModalOpen}
        onClose={() => setIsAddToMonitoringModalOpen(false)}
        onAdd={handleAddBooksToMonitoring}
        allBooks={books}
        existingBookCodes={new Set(monitoringData.map(m => m.bookCode))}
      />
      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      {/* Chat Feature */}
      <ChatButton onClick={() => setIsChatOpen(true)} />
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUser={{
          _id: user._id,
          name: user.name,
          is_admin_access: user.is_admin_access,
          evaluator_id: user.evaluator_id,
        }}
      />
    </Layout >
  );
};

export default App;