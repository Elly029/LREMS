import React, { useState, useMemo, useRef } from 'react';
import { Status } from '../types';
import { STATUS_OPTIONS } from '../constants';
import { StatusPill } from './StatusPill';
import { SearchIcon, CheckIcon } from './Icons';
import { useOnClickOutside } from '../hooks/useOnClickOutside';

interface StatusDropdownProps {
  currentStatus: Status;
  onStatusChange: (newStatus: Status) => void;
  onClose: () => void;
}

export const StatusDropdown: React.FC<StatusDropdownProps> = ({ currentStatus, onStatusChange, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(dropdownRef, onClose);

  const filteredOptions = useMemo(() => {
    return STATUS_OPTIONS.filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleSelectStatus = (status: Status) => {
    onStatusChange(status);
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute z-10 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 animate-fade-in-down"
    >
      <div className="p-2">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon className="h-4 w-4 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Filter statuses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
      </div>
      <ul className="max-h-60 overflow-y-auto p-2">
        {filteredOptions.map(status => (
          <li key={status}>
            <button
              onClick={() => handleSelectStatus(status)}
              className="w-full text-left flex items-center justify-between p-2 my-1 rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
            >
              <StatusPill status={status} />
              {status === currentStatus && (
                <CheckIcon className="h-4 w-4 text-blue-600" />
              )}
            </button>
          </li>
        ))}
        {filteredOptions.length === 0 && (
          <li className="text-center text-sm text-gray-500 py-4">No statuses found.</li>
        )}
      </ul>
    </div>
  );
};
