import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './datepicker-custom.css';
import { Book, Remark } from '../types';
import { CalendarIcon, QuestionMarkCircleIcon } from './Icons';
import { RemarkFormTour } from './RemarkFormTour';

interface AddRemarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRemark: (bookCode: string, remark: Remark) => void;
  book: Book | null;
}

// Calculate days between two dates (inclusive of from date)
const calculateDaysDifference = (fromDate: Date | null, toDate: Date | null): number => {
  if (!fromDate || !toDate) return 0;
  const diffTime = toDate.getTime() - fromDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include from date
  return diffDays > 0 ? diffDays : 0;
};

// Determine delay category based on from/to
const calculateDelays = (from: string, to: string, days: number): { depedDays: number; publisherDays: number } => {
  // Normalize BLR and LRE as same entity
  const normalizeEntity = (entity: string) => {
    if (entity === 'BLR' || entity === 'LRE') return 'DEPED';
    return entity;
  };

  const normalizedFrom = normalizeEntity(from);
  const normalizedTo = normalizeEntity(to);

  // FROM Publisher TO BLR/LRE (DepEd) → DepEd delay
  if (normalizedFrom === 'Publisher' && normalizedTo === 'DEPED') {
    return { depedDays: days, publisherDays: 0 };
  }

  // FROM BLR/LRE TO Publisher → Publisher delay
  if (normalizedFrom === 'DEPED' && normalizedTo === 'Publisher') {
    return { depedDays: 0, publisherDays: days };
  }

  // FROM BLR TO LRE or LRE TO BLR (both DEPED) → DepEd delay
  if (normalizedFrom === 'DEPED' && normalizedTo === 'DEPED') {
    return { depedDays: days, publisherDays: 0 };
  }

  // Default: no delay
  return { depedDays: 0, publisherDays: 0 };
};

export const AddRemarkModal: React.FC<AddRemarkModalProps> = ({ isOpen, onClose, onAddRemark, book }) => {
  const [remarkText, setRemarkText] = useState('');
  const [remarkDate, setRemarkDate] = useState<Date | null>(new Date());
  const [remarkTime, setRemarkTime] = useState(new Date().toTimeString().slice(0, 5));
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState('');
  const [daysCovered, setDaysCovered] = useState(0);
  const [daysDelayDeped, setDaysDelayDeped] = useState(0);
  const [daysDelayPublisher, setDaysDelayPublisher] = useState(0);
  const [isTourActive, setIsTourActive] = useState(false);

  const entityOptions = ['Publisher', 'BLR', 'LRE'];

  useEffect(() => {
    if (isOpen) {
      // Reset form state when modal opens
      setRemarkText('');
      setRemarkDate(new Date());
      setRemarkTime(new Date().toTimeString().slice(0, 5));
      setFromDate(null);
      setToDate(null);
      setFrom('');
      setTo('');
      setStatus('');
      setDaysCovered(0);
      setDaysDelayDeped(0);
      setDaysDelayPublisher(0);
    }
  }, [isOpen]);

  // Auto-calculate days and delays when dates or entities change
  useEffect(() => {
    if (fromDate && toDate) {
      const days = calculateDaysDifference(fromDate, toDate);
      setDaysCovered(days);

      if (from && to) {
        const { depedDays, publisherDays } = calculateDelays(from, to, days);
        setDaysDelayDeped(depedDays);
        setDaysDelayPublisher(publisherDays);
      }
    } else {
      setDaysCovered(0);
      setDaysDelayDeped(0);
      setDaysDelayPublisher(0);
    }
  }, [fromDate, toDate, from, to]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Form values:', { remarkText, remarkDate, remarkTime, fromDate, toDate, from, to, status, daysCovered, daysDelayDeped, daysDelayPublisher });

    if (!book || !remarkText.trim()) {
      console.error('Missing required data:', { book: !!book, remarkText });
      return;
    }

    // Construct timestamp from date and time inputs
    let timestamp = new Date().toISOString();
    if (remarkDate) {
      const dateStr = remarkDate.toISOString().split('T')[0];
      const timeStr = remarkTime || '00:00';
      timestamp = new Date(`${dateStr}T${timeStr}:00`).toISOString();
    }

    const newRemark: Remark = {
      text: remarkText,
      timestamp,
      from: from || undefined,
      to: to || undefined,
      fromDate: fromDate ? fromDate.toISOString() : undefined,
      toDate: toDate ? toDate.toISOString() : undefined,
      status: status.trim() || undefined,
      daysDelayDeped: daysDelayDeped > 0 ? daysDelayDeped : undefined,
      daysDelayPublisher: daysDelayPublisher > 0 ? daysDelayPublisher : undefined,
    };

    console.log('Submitting remark:', newRemark);
    onAddRemark(book.bookCode, newRemark);
  };

  if (!isOpen || !book) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <RemarkFormTour startTour={isTourActive} onTourEnd={() => setIsTourActive(false)} />
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-2xl font-bold text-gray-900">CHRONOLOGICAL PROCESS ON QUALITY ASSURANCE</h2>
          <button
            type="button"
            onClick={() => setIsTourActive(true)}
            className="text-gray-400 hover:text-blue-600 transition-colors"
            title="Start Tour"
          >
            <QuestionMarkCircleIcon className="h-6 w-6" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">For: <span className="font-semibold text-gray-700">{book.title}</span></p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Timeline/Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="remarkDate" className="block text-sm font-medium text-gray-700 mb-1">Timeline/Date</label>
                <div className="relative" id="timeline-date-input">
                  <DatePicker
                    selected={remarkDate}
                    onChange={(date: Date | null) => setRemarkDate(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/mm/yyyy"
                    className="mt-1 block w-full bg-white text-gray-900 border-2 border-gray-300 rounded-xl shadow-sm py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm hover:border-blue-400 transition-colors cursor-pointer"
                    wrapperClassName="w-full"
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <CalendarIcon className="h-5 w-5 text-blue-500" />
                  </span>
                </div>
              </div>
              <div>
                <label htmlFor="remarkTime" className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  id="timeline-time-input"
                  value={remarkTime}
                  onChange={e => setRemarkTime(e.target.value)}
                  className="mt-1 block w-full bg-white text-gray-900 border-2 border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm hover:border-blue-400 transition-colors cursor-pointer"
                />
              </div>
            </div>

            {/* From Date to To Date with Calendar Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <div className="relative" id="from-date-picker">
                  <DatePicker
                    selected={fromDate}
                    onChange={(date: Date | null) => setFromDate(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/mm/yyyy"
                    className="mt-1 block w-full bg-white text-gray-900 border-2 border-gray-300 rounded-xl shadow-sm py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm hover:border-blue-400 transition-colors cursor-pointer"
                    wrapperClassName="w-full"
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <CalendarIcon className="h-5 w-5 text-blue-500" />
                  </span>
                </div>
              </div>
              <div>
                <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <div className="relative" id="to-date-picker">
                  <DatePicker
                    selected={toDate}
                    onChange={(date: Date | null) => setToDate(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/mm/yyyy"
                    minDate={fromDate || undefined}
                    className="mt-1 block w-full bg-white text-gray-900 border-2 border-gray-300 rounded-xl shadow-sm py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm hover:border-blue-400 transition-colors cursor-pointer"
                    wrapperClassName="w-full"
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <CalendarIcon className="h-5 w-5 text-blue-500" />
                  </span>
                </div>
              </div>
            </div>

            {/* Days Covered (Read-only, Auto-calculated) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. of Days Covered</label>
              <div id="days-covered-display" className="mt-1 block w-full bg-gray-100 text-gray-700 border-2 border-gray-200 rounded-xl shadow-sm py-3 px-4 font-semibold text-lg">
                {daysCovered} {daysCovered === 1 ? 'day' : 'days'}
              </div>
            </div>

            {/* From and To Dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <select
                  id="from-entity-select"
                  value={from}
                  onChange={e => setFrom(e.target.value)}
                  className="mt-1 block w-full bg-white text-gray-900 border-2 border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm hover:border-blue-400 transition-colors cursor-pointer"
                >
                  <option value="">Select...</option>
                  {entityOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <select
                  id="to-entity-select"
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  className="mt-1 block w-full bg-white text-gray-900 border-2 border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm hover:border-blue-400 transition-colors cursor-pointer"
                >
                  <option value="">Select...</option>
                  {entityOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <textarea
                id="status-textarea"
                value={status}
                onChange={e => setStatus(e.target.value)}
                rows={3}
                placeholder="e.g., BLR-QAD received the 3rd revised and the 2nd revised copies of the set of TX and TM."
                className="mt-1 block w-full bg-white text-gray-900 border-2 border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none hover:border-blue-400 transition-colors"
              />
            </div>

            {/* Days Delay (Auto-calculated, Read-only) */}
            <div id="delay-display-section" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Days Delay - Due to DepEd</label>
                <div className="mt-1 block w-full bg-blue-50 text-blue-700 border-2 border-blue-200 rounded-xl shadow-sm py-3 px-4 font-semibold text-lg">
                  {daysDelayDeped} {daysDelayDeped === 1 ? 'day' : 'days'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Days Delay - Due to Publisher</label>
                <div className="mt-1 block w-full bg-orange-50 text-orange-700 border-2 border-orange-200 rounded-xl shadow-sm py-3 px-4 font-semibold text-lg">
                  {daysDelayPublisher} {daysDelayPublisher === 1 ? 'day' : 'days'}
                </div>
              </div>
            </div>

            {/* Remark Text */}
            <div>
              <label htmlFor="remarkText" className="block text-sm font-medium text-gray-700 mb-1">
                Remark/Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                id="remark-text-area"
                value={remarkText}
                onChange={e => setRemarkText(e.target.value)}
                rows={4}
                placeholder="Enter additional remarks or notes..."
                className="mt-1 block w-full bg-white text-gray-900 border-2 border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none hover:border-blue-400 transition-colors"
                required
                autoFocus
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" id="submit-remark-btn" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Add Remark
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};