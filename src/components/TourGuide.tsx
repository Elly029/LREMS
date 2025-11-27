import React, { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface TourGuideProps {
    startTour: boolean;
    onTourEnd: () => void;
}

export const TourGuide: React.FC<TourGuideProps> = ({ startTour, onTourEnd }) => {
    useEffect(() => {
        if (startTour) {
            const driverObj = driver({
                showProgress: true,
                animate: true,
                steps: [
                    {
                        element: '#dashboard-stats',
                        popover: {
                            title: 'Dashboard Overview',
                            description: 'Here you can see a quick summary of your library statistics, including total books, unique publishers, and learning areas.',
                            side: 'bottom',
                            align: 'start'
                        }
                    },
                    {
                        element: '#search-bar',
                        popover: {
                            title: 'Search Books',
                            description: 'Quickly find books by title, code, or remarks using this search bar.',
                            side: 'bottom'
                        }
                    },
                    {
                        element: '#export-buttons',
                        popover: {
                            title: 'Export Data',
                            description: 'Download your book data in PDF or Excel format for reporting and offline use.',
                            side: 'bottom'
                        }
                    },
                    {
                        element: '#add-book-btn',
                        popover: {
                            title: 'Add New Book',
                            description: 'Click here to register a new book into the system.',
                            side: 'bottom'
                        }
                    },
                    {
                        element: '#data-table',
                        popover: {
                            title: 'Book Records',
                            description: 'This is the main table where you can view, sort, and filter all your book records. You can also edit or delete entries from here.',
                            side: 'top'
                        }
                    },
                    {
                        element: '#user-menu-btn',
                        popover: {
                            title: 'User Profile',
                            description: 'Access your profile settings, change your password, or sign out from here.',
                            side: 'left'
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
