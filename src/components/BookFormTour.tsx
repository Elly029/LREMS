import React, { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface BookFormTourProps {
    startTour: boolean;
    onTourEnd: () => void;
    isEditing: boolean;
}

export const BookFormTour: React.FC<BookFormTourProps> = ({ startTour, onTourEnd, isEditing }) => {
    useEffect(() => {
        if (startTour) {
            const steps = [
                {
                    element: '#book-code-input',
                    popover: {
                        title: 'Book Code',
                        description: 'Optional: Enter a custom book code or leave blank to auto-generate. When editing, changing this will update the book code.',
                        side: 'bottom' as const
                    }
                },
                {
                    element: '#book-title-input',
                    popover: {
                        title: 'Book Title',
                        description: 'Enter the full title of the book here.',
                        side: 'bottom' as const
                    }
                },
                {
                    element: '#learning-area-input',
                    popover: {
                        title: 'Learning Area',
                        description: 'Specify the subject or learning area (e.g., Mathematics, Science).',
                        side: 'bottom' as const
                    }
                },
                {
                    element: '#grade-level-input',
                    popover: {
                        title: 'Grade Level',
                        description: 'Enter the grade level for this book (e.g., 1, 3).',
                        side: 'bottom' as const
                    }
                },
                {
                    element: '#publisher-input',
                    popover: {
                        title: 'Publisher',
                        description: 'Enter the name of the publisher.',
                        side: 'bottom' as const
                    }
                },
                {
                    element: '#status-select',
                    popover: {
                        title: 'Status',
                        description: 'Select the current status of the book (e.g., For Evaluation, For Revision).',
                        side: 'bottom' as const
                    }
                },
                // Only show Initial Remark step if NOT editing
                ...(!isEditing ? [{
                    element: '#initial-remark-input',
                    popover: {
                        title: 'Initial Remark',
                        description: 'Optional: Add any initial notes or remarks about this book.',
                        side: 'top' as const
                    }
                }] : []),
                {
                    element: '#save-book-btn',
                    popover: {
                        title: 'Save Book',
                        description: 'Click here to save the new book to the inventory.',
                        side: 'top' as const
                    }
                }
            ];

            const driverObj = driver({
                showProgress: true,
                animate: true,
                steps: steps,
                onDestroyStarted: () => {
                    if (onTourEnd) onTourEnd();
                    driverObj.destroy();
                },
            });

            driverObj.drive();
        }
    }, [startTour, onTourEnd, isEditing]);

    return null;
};
