import React from 'react';
import { Book } from '../types';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import { FileDownloadIcon } from './Icons';

interface ExportButtonsProps {
    books: Book[];
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ books }) => {
    return (
        <div className="flex gap-2">
            <button
                onClick={() => exportToPDF(books)}
                className="btn btn-secondary py-2.5"
                title="Export to PDF"
            >
                <FileDownloadIcon className="h-4 w-4 sm:mr-2 text-deped-red" />
                <span className="hidden sm:inline">PDF</span>
            </button>
            <button
                onClick={() => exportToExcel(books)}
                className="btn btn-secondary py-2.5"
                title="Export to Excel"
            >
                <FileDownloadIcon className="h-4 w-4 sm:mr-2 text-green-600" />
                <span className="hidden sm:inline">Excel</span>
            </button>
        </div>
    );
};
