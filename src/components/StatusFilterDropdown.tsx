import React, { useState, useMemo, useRef } from 'react';
import { Status } from '../types';
import { STATUS_OPTIONS, STATUS_STYLES } from '../constants';
import { SearchIcon, CloseIcon } from './Icons';
import { useOnClickOutside } from '../hooks/useOnClickOutside';

interface StatusFilterDropdownProps {
  selectedStatuses: Status[];
  onChange: (selected: Status[]) => void;
  onClose: () => void;
}

export const StatusFilterDropdown: React.FC<StatusFilterDropdownProps> = ({ selectedStatuses, onChange, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(dropdownRef, onClose);

  const filteredOptions = useMemo(() => {
    return STATUS_OPTIONS.filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleToggleStatus = (status: Status) => {
    const newSelected = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status];
    onChange(newSelected);
  };

  return (
    <div ref={dropdownRef} className="absolute z-50 mt-2 left-0 right-0 sm:left-0 sm:right-auto w-full sm:w-80 max-w-sm bg-white rounded-lg shadow-2xl border border-gray-200">
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-sm text-gray-800">Filter by Status</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
          <CloseIcon className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      <div className="p-3">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon className="h-4 w-4 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search statuses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
      <ul className="max-h-64 overflow-y-auto p-2">
        {filteredOptions.map(status => (
          <li key={status}>
            <label className="w-full text-left flex items-center p-2.5 my-0.5 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={selectedStatuses.includes(status)}
                onChange={() => handleToggleStatus(status)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 flex-shrink-0"
              />
              <span className={`ml-3 px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${STATUS_STYLES[status]} truncate`}>
                {status}
              </span>
            </label>
          </li>
        ))}
        {filteredOptions.length === 0 && (
          <li className="text-center text-sm text-gray-500 py-4">No statuses found.</li>
        )}
      </ul>
      {selectedStatuses.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => onChange([])}
              className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline transition-colors"
            >
              Clear all ({selectedStatuses.length})
            </button>
        </div>
      )}
    </div>
  );
};