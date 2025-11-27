import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Book } from '../types';

import logo from '../assets/logo.png';

export const exportToPDF = (books: Book[]) => {
    const doc = new jsPDF({ orientation: 'landscape' });

    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;

    // Add Logo
    const logoSize = 20;
    const logoX = centerX - (logoSize / 2);
    doc.addImage(logo, 'PNG', logoX, 10, logoSize, logoSize);

    // Add title
    doc.setFontSize(18);
    doc.text("Textbooks and Teacher's Manual Inventory", centerX, 38, { align: 'center' });

    // Add subtitle
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text("Grades 1 & 3 Records", centerX, 45, { align: 'center' });

    // Add date
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 55);

    // Define columns
    const tableColumn = ["Book Code", "Learning Area", "Grade Level", "Publisher", "Title", "Status", "Remarks"];

    // Define rows
    const tableRows = books.map(book => [
        book.bookCode,
        book.learningArea,
        book.gradeLevel,
        book.publisher,
        book.title,
        book.status,
        book.remarks.length > 0 ? book.remarks[0].text : ""
    ]);

    // Generate table
    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 60,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [79, 70, 229], halign: 'center' },
        columnStyles: {
            0: { cellWidth: 25 }, // Book Code
            1: { cellWidth: 20 }, // Learning Area
            2: { cellWidth: 15, halign: 'center' }, // Grade Level
            3: { cellWidth: 40 }, // Publisher
            4: { cellWidth: 'auto' }, // Title
            5: { cellWidth: 30 }, // Status
            6: { cellWidth: 50 }  // Remarks
        }
    });

    doc.save('book_inventory.pdf');
};

export const exportToExcel = (books: Book[]) => {
    const worksheet = XLSX.utils.json_to_sheet(books.map(book => ({
        "Book Code": book.bookCode,
        "Learning Area": book.learningArea,
        "Grade Level": book.gradeLevel,
        "Publisher": book.publisher,
        "Title": book.title,
        "Status": book.status,
        "Latest Remark": book.remarks.length > 0 ? book.remarks[0].text : ""
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, "book_inventory.xlsx");
};
