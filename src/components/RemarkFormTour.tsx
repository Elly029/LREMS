import React, { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface RemarkFormTourProps {
    startTour: boolean;
    onTourEnd: () => void;
}

export const RemarkFormTour: React.FC<RemarkFormTourProps> = ({ startTour, onTourEnd }) => {
    useEffect(() => {
        if (startTour) {
            const driverObj = driver({
                showProgress: true,
                animate: true,
                steps: [
                    {
                        element: '#timeline-date-input',
                        popover: {
                            title: 'Timeline Date',
                            description: 'Select the specific date for this remark/event.',
                            side: 'bottom'
                        }
                    },
                    {
                        element: '#timeline-time-input',
                        popover: {
                            title: 'Time',
                            description: 'Set the time when this event occurred.',
                            side: 'bottom'
                        }
                    },
                    {
                        element: '#from-date-picker',
                        popover: {
                            title: 'From Date',
                            description: 'Start date of the process or period being recorded.',
                            side: 'bottom'
                        }
                    },
                    {
                        element: '#to-date-picker',
                        popover: {
                            title: 'To Date',
                            description: 'End date of the process. The system will automatically calculate the number of days covered.',
                            side: 'bottom'
                        }
                    },
                    {
                        element: '#days-covered-display',
                        popover: {
                            title: 'Days Covered',
                            description: 'Shows the total number of days calculated from the date range.',
                            side: 'top'
                        }
                    },
                    {
                        element: '#from-entity-select',
                        popover: {
                            title: 'From Entity',
                            description: 'Who initiated or sent the document/material?',
                            side: 'bottom'
                        }
                    },
                    {
                        element: '#to-entity-select',
                        popover: {
                            title: 'To Entity',
                            description: 'Who received the document/material?',
                            side: 'bottom'
                        }
                    },
                    {
                        element: '#status-textarea',
                        popover: {
                            title: 'Status Description',
                            description: 'Describe the specific action or status update (e.g., "Received 3rd revised copy").',
                            side: 'top'
                        }
                    },
                    {
                        element: '#delay-display-section',
                        popover: {
                            title: 'Delay Calculation',
                            description: 'Automatically calculates delays attributed to DepEd or the Publisher based on the "From" and "To" entities.',
                            side: 'top'
                        }
                    },
                    {
                        element: '#remark-text-area',
                        popover: {
                            title: 'Remark/Notes',
                            description: 'Enter the main content of your remark here. This field is required.',
                            side: 'top'
                        }
                    },
                    {
                        element: '#submit-remark-btn',
                        popover: {
                            title: 'Add Remark',
                            description: 'Save this chronological entry to the book\'s history.',
                            side: 'top'
                        }
                    }
                ],
                onDestroyStarted: () => {
                    if (onTourEnd) onTourEnd();
                    driverObj.destroy();
                },
            });

            driverObj.drive();
        }
    }, [startTour, onTourEnd]);

    return null;
};
