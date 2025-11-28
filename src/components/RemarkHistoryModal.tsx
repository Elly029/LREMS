import React, { useState } from 'react';
import { Book, Remark } from '../types';
import { FileDownloadIcon, EditIcon, DeleteIcon } from './Icons';
import logo from '../assets/logo.png';
import { EditRemarkModal } from './EditRemarkModal';
import { bookApi } from '../services/bookService';

// TypeScript declarations for global libraries from CDN
declare const jspdf: any;
declare const XLSX: any;

// Extend jsPDF with autotable
interface jsPDFWithAutoTable {
  autoTable: (options: any) => any;
}

interface RemarkHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  onDataChange: () => void;
  onAddRemark?: () => void;
}


const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const formatDateRange = (fromDate?: string, toDate?: string) => {
  if (!fromDate && !toDate) return '-';

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (fromDate && toDate) {
    const formattedFrom = formatDate(fromDate);
    const formattedTo = formatDate(toDate);

    // If both dates are the same, only show one date
    if (formattedFrom === formattedTo) {
      return formattedFrom;
    }

    return `${formattedFrom} - ${formattedTo}`;
  }

  return fromDate ? formatDate(fromDate) : (toDate ? formatDate(toDate) : '-');
};

export const RemarkHistoryModal: React.FC<RemarkHistoryModalProps> = ({ isOpen, onClose, book, onDataChange, onAddRemark }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRemark, setEditingRemark] = useState<Remark | null>(null);
  const [editingRemarkId, setEditingRemarkId] = useState<string | null>(null);

  if (!isOpen || !book) return null;

  // Sort remarks chronologically (oldest first) by from_date, then timestamp
  const sortedRemarks = [...(book.remarks || [])].sort((a, b) => {
    const dateA = a.fromDate ? new Date(a.fromDate).getTime() : new Date(a.timestamp).getTime();
    const dateB = b.fromDate ? new Date(b.fromDate).getTime() : new Date(b.timestamp).getTime();
    return dateA - dateB; // Ascending order (oldest first)
  });

  // Helper function to check if a remark has complete data for export
  const isRemarkComplete = (remark: Remark): boolean => {
    // A remark is considered incomplete if it has:
    // - No fromDate AND no toDate (both empty)
    // - No from entity selected (empty or "Select...")
    // - No to entity selected (empty or "Select...")
    // - Both delays are 0 or undefined
    const hasDateRange = remark.fromDate || remark.toDate;
    const hasFromEntity = remark.from && remark.from !== 'Select...';
    const hasToEntity = remark.to && remark.to !== 'Select...';
    const hasDelays = (remark.daysDelayDeped && remark.daysDelayDeped > 0) || 
                      (remark.daysDelayPublisher && remark.daysDelayPublisher > 0);
    const hasStatus = remark.status && remark.status.trim() !== '';
    
    // Remark is complete if it has at least date range AND from/to entities
    // OR if it has meaningful delay data
    return (hasDateRange && hasFromEntity && hasToEntity) || hasDelays || hasStatus;
  };

  const handleExportPDF = () => {
    // Filter out incomplete remarks for export
    const remarksToExport = sortedRemarks.filter(isRemarkComplete);
    
    const doc = new jspdf.jsPDF();

    // Add Logo on the left
    const logoSize = 30;
    doc.addImage(logo, 'PNG', 14, 10, logoSize, logoSize);

    // Main Title - positioned to the right of logo, centered vertically with logo
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('CHRONOLOGICAL PROCESS ON QUALITY ASSURANCE', 50, 27);

    // Book details below the title
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Title: ${book.title}`, 14, 50);
    doc.text(`Publisher: ${book.publisher}`, 14, 57);
    doc.text(`Grade Level: ${book.gradeLevel} | Learning Area: ${book.learningArea}`, 14, 64);

    const ntpDateStr = book.ntpDate ? new Date(book.ntpDate).toLocaleDateString() : 'N/A';
    doc.text(`NTP Date: ${ntpDateStr}`, 14, 71);

    // Prepare table data
    const data = remarksToExport.map(remark => {
      const timelineDate = formatDateRange(remark.fromDate, remark.toDate);
      const from = remark.from || '-';
      const to = remark.to || '-';
      const remarks = remark.text || '-';
      const depEdDelay = remark.daysDelayDeped || 0;
      const publisherDelay = remark.daysDelayPublisher || 0;

      return [timelineDate, from, to, remarks, depEdDelay.toString(), publisherDelay.toString()];
    });

    // Calculate totals from filtered remarks
    const totalDepEd = remarksToExport.reduce((sum, r) => sum + (r.daysDelayDeped || 0), 0);
    const totalPublisher = remarksToExport.reduce((sum, r) => sum + (r.daysDelayPublisher || 0), 0);
    const totalDays = totalDepEd + totalPublisher;

    // Add table to PDF with custom header structure and page break handling
    (doc as any).autoTable({
      head: [
        [
          { content: 'Timeline/Date', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'From', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'To', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'Remarks', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'No. of Days Delay / In-Charge', colSpan: 2, styles: { halign: 'center' } }
        ],
        [
          { content: 'Due to DepEd', styles: { halign: 'center' } },
          { content: 'Due to Publisher', styles: { halign: 'center' } }
        ]
      ],
      body: data,
      startY: 85,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.5
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 18 },
        2: { cellWidth: 18 },
        3: { cellWidth: 70 },
        4: { cellWidth: 22, halign: 'center' },
        5: { cellWidth: 22, halign: 'center' }
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      margin: { top: 35, left: 14, right: 20, bottom: 40 },
      showHead: 'everyPage',
      didDrawPage: (data: any) => {
        const pageCount = doc.internal.getNumberOfPages();
        const pageNumber = data.pageNumber;

        // Add header on every page except the first
        if (pageNumber > 1) {
          // Reset drawing state
          doc.setDrawColor(0);
          doc.setFillColor(255, 255, 255);
          doc.setLineWidth(0);

          // Logo
          doc.addImage(logo, 'PNG', 14, 10, 20, 20);

          // Title
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text('CHRONOLOGICAL PROCESS ON QUALITY ASSURANCE', 40, 18);
        }

        // Add page numbers to all pages
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        const pageText = `Page ${pageNumber} of ${pageCount}`;
        const pageWidth = doc.internal.pageSize.width;
        const textWidth = doc.getTextWidth(pageText);
        doc.text(pageText, pageWidth - textWidth - 14, doc.internal.pageSize.height - 10);
      }
    });

    // Get the Y position after the main table
    let finalY = (doc as any).lastAutoTable.finalY + 10;

    // Check if we need a new page for summary and signatures
    const pageHeight = doc.internal.pageSize.height;
    const spaceNeeded = 80; // Space needed for summary, signatures

    if (finalY + spaceNeeded > pageHeight - 20) {
      doc.addPage();
      finalY = 20;
    }

    // Add summary table on the right side
    const summaryTableX = 140; // Position on the right
    (doc as any).autoTable({
      body: [
        ['Total', totalDays.toString()],
        ['DepEd', totalDepEd.toString()],
        ['Publisher', totalPublisher.toString()]
      ],
      startY: finalY,
      margin: { left: summaryTableX },
      tableWidth: 55,
      styles: {
        fontSize: 10,
        cellPadding: 3,
        lineColor: [0, 0, 0],
        lineWidth: 0.5
      },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold' },
        1: { cellWidth: 20, halign: 'center' }
      },
      theme: 'grid'
    });

    // Update finalY to be after the summary table
    finalY = Math.max((doc as any).lastAutoTable.finalY, finalY) + 15;

    // Add signature sections
    const leftX = 14;
    const rightX = 110;

    // Prepared by (left side)
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text('Prepared by:', leftX, finalY);

    // Noted by (right side)
    doc.text('Noted by:', rightX, finalY);

    // Add space for signatures
    const signatureY = finalY + 20;

    // Left signature - Prepared by
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Elesito Tuyor', leftX, signatureY);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text('Creative Arts Specialist II', leftX, signatureY + 5);

    // Right signature - Noted by
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('JUAN CARLOS D. SARMIENTO', rightX, signatureY);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text('Officer-In-Charge', rightX, signatureY + 5);
    doc.text('Supervising Education Specialist', rightX, signatureY + 10);

    // Save the PDF
    doc.save(`quality-assurance-${book.bookCode}.pdf`);
  };

  const handleExportExcel = () => {
    // Filter out incomplete remarks for export
    const remarksToExport = sortedRemarks.filter(isRemarkComplete);
    
    // Prepare data for export with the specified header format
    const exportData = remarksToExport.map(remark => ({
      'Timeline/Date': formatDateRange(remark.fromDate, remark.toDate),
      'From': remark.from || '-',
      'To': remark.to || '-',
      'Remarks': remark.text || '-',
      'Due to DepEd': remark.daysDelayDeped || 0,
      'Due to Publisher': remark.daysDelayPublisher || 0
    }));

    // Calculate totals from filtered remarks
    const totalDepEd = remarksToExport.reduce((sum, r) => sum + (r.daysDelayDeped || 0), 0);
    const totalPublisher = remarksToExport.reduce((sum, r) => sum + (r.daysDelayPublisher || 0), 0);

    // Add totals row
    exportData.push({
      'Timeline/Date': '',
      'From': '',
      'To': '',
      'Remarks': 'Total',
      'Due to DepEd': totalDepEd,
      'Due to Publisher': totalPublisher
    } as any);

    exportData.push({
      'Timeline/Date': '',
      'From': '',
      'To': '',
      'Remarks': 'DepEd',
      'Due to DepEd': totalDepEd,
      'Due to Publisher': ''
    } as any);

    exportData.push({
      'Timeline/Date': '',
      'From': '',
      'To': '',
      'Remarks': 'Publisher',
      'Due to DepEd': '',
      'Due to Publisher': totalPublisher
    } as any);

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Quality Assurance');

    // Export to file
    XLSX.writeFile(wb, `quality-assurance-${book.bookCode}.xlsx`);
  };

  const handleEditRemark = (remark: Remark, index: number) => {
    // Use the remark's id if it exists, otherwise fall back to index
    setEditingRemark(remark);
    setEditingRemarkId(remark.id || index.toString());
    setIsEditModalOpen(true);
  };

  const handleSaveEditedRemark = async (remarkId: string, updatedRemark: Remark) => {
    try {
      if (!book) return;

      // Call the API to update the remark
      await bookApi.updateRemark(book.bookCode, remarkId, updatedRemark);

      // Close the edit modal
      setIsEditModalOpen(false);
      setEditingRemark(null);
      setEditingRemarkId(null);

      // Show success message
      alert('Remark updated successfully!');

      // Refresh the book data to show updated remark
      // Refresh the book data to show updated remark
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error('Error updating remark:', error);
      alert('Failed to update remark. Please try again.');
    }
  };

  const handleDeleteRemark = async (remarkId: string, index: number) => {
    try {
      if (!book) return;

      // Ask for confirmation
      const confirmDelete = window.confirm('Are you sure you want to delete this remark? This action cannot be undone.');

      if (!confirmDelete) {
        return;
      }

      // Use the remark's id if it exists, otherwise show error
      const id = remarkId || sortedRemarks[index]?.id;

      if (!id) {
        alert('Cannot delete this remark: Invalid remark ID');
        return;
      }

      // Call the API to delete the remark
      await bookApi.deleteRemark(book.bookCode, id);

      // Show success message
      alert('Remark deleted successfully!');

      // Refresh the book data
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error('Error deleting remark:', error);
      alert('Failed to delete remark. Please try again.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-hidden transform transition-all" onClick={e => e.stopPropagation()}>
          <h2 className="text-3xl font-bold text-gray-900">CHRONOLOGICAL PROCESS ON QUALITY ASSURANCE</h2>
          <p className="text-sm text-gray-500 mt-1 mb-6 border-b border-gray-200 pb-4">
            For: <span className="font-semibold text-gray-700">{book.title}</span>
          </p>

          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
            {sortedRemarks.length > 0 ? (
              sortedRemarks.map((remark, index) => (
                <div key={index} className="bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-500 rounded-lg p-5 shadow-sm">
                  {/* Header with timestamp and creator */}
                  <div className="flex justify-between items-start mb-3 pb-2 border-b border-gray-200">
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      Entry #{index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditRemark(remark, index)}
                        className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-md hover:bg-blue-50"
                        title="Edit remark"
                      >
                        <EditIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRemark(remark.id || index.toString(), index)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50"
                        title="Delete remark"
                      >
                        <DeleteIcon className="h-4 w-4" />
                      </button>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-700">
                          {formatTimestamp(remark.timestamp)}
                        </div>
                        {remark.createdBy && (
                          <div className="text-xs text-gray-500 mt-1">
                            by {remark.createdBy}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* QA Process Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {remark.from && (
                      <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase">From</span>
                        <div className="text-sm font-medium text-gray-800 mt-1">{remark.from}</div>
                      </div>
                    )}
                    {remark.to && (
                      <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase">To</span>
                        <div className="text-sm font-medium text-gray-800 mt-1">{remark.to}</div>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  {remark.status && (
                    <div className="mb-3">
                      <span className="text-xs font-semibold text-gray-500 uppercase">Status</span>
                      <div className="text-sm text-gray-800 mt-1 bg-white p-2 rounded border border-gray-200">
                        {remark.status}
                      </div>
                    </div>
                  )}

                  {/* Date Range */}
                  {(remark.fromDate || remark.toDate) && (
                    <div className="mb-3">
                      <span className="text-xs font-semibold text-gray-500 uppercase">Date Range</span>
                      <div className="text-sm text-gray-800 mt-1 bg-white p-2 rounded border border-gray-200">
                        {formatDateRange(remark.fromDate, remark.toDate)}
                      </div>
                    </div>
                  )}

                  {/* Days Covered and Delays */}
                  {(remark.daysDelayDeped !== undefined || remark.daysDelayPublisher !== undefined) && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                      <div className="bg-blue-50 p-2 rounded">
                        <span className="text-xs font-semibold text-blue-700">DepEd Delay</span>
                        <div className="text-sm font-bold text-blue-900">{remark.daysDelayDeped || 0} days</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <span className="text-xs font-semibold text-green-700">Publisher Delay</span>
                        <div className="text-sm font-bold text-green-900">{remark.daysDelayPublisher || 0} days</div>
                      </div>
                    </div>
                  )}

                  {/* Remark Text */}
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase">Remark/Notes</span>
                    <div className="text-sm text-gray-800 mt-1 bg-white p-3 rounded border border-gray-200 whitespace-pre-wrap">
                      {remark.text}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">No chronological records found</div>
                <button
                  onClick={onClose}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              {onAddRemark && (
                <button
                  onClick={onAddRemark}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Entry
                </button>
              )}
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-2 px-4 rounded-lg transition-colors border border-red-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 font-semibold py-2 px-4 rounded-lg transition-colors border border-green-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Excel
              </button>
            </div>
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {isEditModalOpen && editingRemark && editingRemarkId && (
        <EditRemarkModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingRemark(null);
            setEditingRemarkId(null);
          }}
          onSaveRemark={handleSaveEditedRemark}
          book={book}
          remark={editingRemark}
          remarkId={editingRemarkId}
        />
      )}
    </>
  );
};

export default RemarkHistoryModal;