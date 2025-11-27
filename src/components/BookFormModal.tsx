import React, { useState, useEffect } from 'react';
import { Book, Status } from '../types';
import { STATUS_OPTIONS } from '../constants';
import { BookFormTour } from './BookFormTour';
import { QuestionMarkCircleIcon } from './Icons';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (book: Omit<Book, 'remarks' | 'bookCode'> & { remark: string; bookCode?: string }) => void;
  book: Book | null;
}

const emptyBook: Omit<Book, 'remarks'> & { remark: string; bookCode?: string } = {
  bookCode: '',
  learningArea: '',
  gradeLevel: 3,
  publisher: '',
  title: '',
  status: STATUS_OPTIONS[0],
  remark: '',
  ntpDate: undefined,
};

export const BookFormModal: React.FC<BookFormModalProps> = ({ isOpen, onClose, onSave, book }) => {
  const [formData, setFormData] = useState(emptyBook);
  const [isTourActive, setIsTourActive] = useState(false);

  useEffect(() => {
    if (book) {
      // When editing, we don't handle remarks here, so we extract them.
      const { remarks, ...bookData } = book;

      // Format ntpDate to YYYY-MM-DD for the date input
      const formattedNtpDate = bookData.ntpDate
        ? new Date(bookData.ntpDate).toISOString().split('T')[0]
        : undefined;

      setFormData({
        ...bookData,
        ntpDate: formattedNtpDate,
        remark: ''
      });
    } else {
      setFormData(emptyBook);
    }
  }, [book, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'gradeLevel' ? parseInt(value) || 0 : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      bookCode: formData.bookCode,
    };

    // Only include remark if it's not empty and we're creating/it was provided
    if (!book || !formData.remark) {
      // When editing, don't send empty remark field to avoid creating empty remarks
      const { remark, ...dataWithoutRemark } = dataToSave;
      if (!formData.remark) {
        onSave(dataWithoutRemark as any);
        return;
      }
    }

    onSave(dataToSave);
  };

  if (!isOpen) return null;

  const inputClasses = "mt-1 block w-full bg-white text-gray-900 border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-shadow";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <BookFormTour startTour={isTourActive} onTourEnd={() => setIsTourActive(false)} isEditing={!!book} />
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl leading-6 font-bold text-gray-900" id="modal-title">
                    {book ? 'Edit Book Details' : 'Add New Book'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsTourActive(true)}
                    className="text-gray-400 hover:text-primary-600 transition-colors"
                    title="Start Tour"
                  >
                    <QuestionMarkCircleIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {book ? 'Update the information for this book below.' : 'Fill in the details to add a new book to the inventory.'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div className="md:col-span-2">
                      <label htmlFor="bookCode" className={labelClasses}>Book Code</label>
                      <input
                        type="text"
                        name="bookCode"
                        id="book-code-input"
                        value={formData.bookCode || ''}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder={book ? "Leave unchanged to keep current code" : "Optional: Enter a custom book code"}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {book ? "Changing this will update the code for this book." : "Leave blank to auto-generate."}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="title" className={labelClasses}>Title</label>
                      <input type="text" name="title" id="book-title-input" value={formData.title} onChange={handleChange} required className={inputClasses} placeholder="e.g. Mathematics for Grade 1" />
                    </div>
                    <div>
                      <label htmlFor="learningArea" className={labelClasses}>Learning Area</label>
                      <input type="text" name="learningArea" id="learning-area-input" value={formData.learningArea} onChange={handleChange} required className={inputClasses} placeholder="e.g. Mathematics" />
                    </div>
                    <div>
                      <label htmlFor="gradeLevel" className={labelClasses}>Grade Level</label>
                      <input type="number" name="gradeLevel" id="grade-level-input" value={formData.gradeLevel} onChange={handleChange} required className={inputClasses} />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="publisher" className={labelClasses}>Publisher</label>
                      <input type="text" name="publisher" id="publisher-input" value={formData.publisher} onChange={handleChange} required className={inputClasses} placeholder="e.g. DepEd" />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="status" className={labelClasses}>Status</label>
                      <select name="status" id="status-select" value={formData.status} onChange={handleChange} className={inputClasses}>
                        {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="ntpDate" className={labelClasses}>NTP Date (Notice to Proceed)</label>
                      <input
                        type="date"
                        name="ntpDate"
                        id="ntp-date-input"
                        value={formData.ntpDate || ''}
                        onChange={handleChange}
                        className={inputClasses}
                      />
                      <p className="mt-1 text-xs text-gray-500">Optional: Set the Notice to Proceed date</p>
                    </div>
                    {!book && (
                      <div className="md:col-span-2">
                        <label htmlFor="remark" className={labelClasses}>Initial Remark</label>
                        <textarea name="remark" id="initial-remark-input" value={formData.remark} onChange={handleChange} rows={3} className={`${inputClasses} resize-none`} placeholder="Optional: Add an initial remark..."></textarea>
                      </div>
                    )}
                  </div>
                  <div className="mt-8 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      Cancel
                    </button>
                    <button type="submit" id="save-book-btn" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      {book ? 'Save Changes' : 'Add Book'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
