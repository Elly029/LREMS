import React from 'react';
import { Status } from '../types';
import { STATUS_STYLES } from '../constants';

interface StatusPillProps {
  status: Status;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};
