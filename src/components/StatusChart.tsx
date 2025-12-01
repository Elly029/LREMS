import React, { useEffect, useState } from 'react';
import { bookApi } from '../services/bookService';
import { Book, Status } from '../types';
import '../components/StatusChart.css';

interface StatusData {
    learningArea: string;
    statuses: {
        [key: string]: number;
    };
    total: number;
}

const StatusChart: React.FC = () => {
    const [chartData, setChartData] = useState<StatusData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Define all 8 learning areas
    const learningAreas = [
        'Language',
        'Reading and Literacy',
        'Mathematics',
        'Science',
        'GMRC',
        'Makabansa',
        'Filipino',
        'English'
    ];

    // Status colors mapping
    const statusColors: { [key: string]: string } = {
        'For ROR': '#4F46E5', // Indigo
        'For Evaluation': '#F59E0B', // Amber
        'For Revision': '#EF4444', // Red
        'For Finalization': '#10B981', // Green
        'For FRR and Signing Off': '#8B5CF6', // Purple
        'Final Revised copy': '#06B6D4', // Cyan
        'NOT FOUND': '#6B7280', // Gray
        'RETURNED': '#EC4899', // Pink
        'DQ/FOR RETURN': '#DC2626', // Dark Red
        'In Progress': '#3B82F6', // Blue
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all books with admin view
            const response = await bookApi.fetchBooks({
                limit: 1000, // Get all books
                adminView: true,
            });

            // Process data by learning area and status
            const dataByArea: { [key: string]: StatusData } = {};

            // Initialize all learning areas
            learningAreas.forEach(area => {
                dataByArea[area] = {
                    learningArea: area,
                    statuses: {},
                    total: 0,
                };
            });

            // Count books by learning area and status
            response.books.forEach((book: Book) => {
                const area = book.learningArea;
                const status = book.status;

                if (dataByArea[area]) {
                    if (!dataByArea[area].statuses[status]) {
                        dataByArea[area].statuses[status] = 0;
                    }
                    dataByArea[area].statuses[status]++;
                    dataByArea[area].total++;
                }
            });

            // Convert to array and sort by total (descending)
            const chartDataArray = Object.values(dataByArea).sort((a, b) => b.total - a.total);
            setChartData(chartDataArray);
        } catch (err) {
            console.error('Error fetching chart data:', err);
            setError('Failed to load chart data');
        } finally {
            setLoading(false);
        }
    };

    // Get all unique statuses from the data
    const getAllStatuses = (): string[] => {
        const statusSet = new Set<string>();
        chartData.forEach(area => {
            Object.keys(area.statuses).forEach(status => statusSet.add(status));
        });
        return Array.from(statusSet);
    };

    // Calculate the maximum total for scaling
    const maxTotal = Math.max(...chartData.map(d => d.total), 1);

    if (loading) {
        return (
            <div className="status-chart-container">
                <div className="loading-spinner">Loading chart data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="status-chart-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    const allStatuses = getAllStatuses();

    return (
        <div className="status-chart-container">
            <div className="chart-header">
                <h2 className="chart-title">Learning Resource Status by Learning Area</h2>
                <button className="refresh-button" onClick={fetchData} title="Refresh data">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                    </svg>
                </button>
            </div>

            {/* Legend */}
            <div className="chart-legend">
                {allStatuses.map(status => (
                    <div key={status} className="legend-item">
                        <div
                            className="legend-color"
                            style={{ backgroundColor: statusColors[status] || '#94A3B8' }}
                        />
                        <span className="legend-label">{status}</span>
                    </div>
                ))}
            </div>

            {/* Chart */}
            <div className="chart-content">
                <div className="chart-y-axis">
                    {chartData.map(data => (
                        <div key={data.learningArea} className="y-axis-label">
                            {data.learningArea}
                        </div>
                    ))}
                </div>

                <div className="chart-bars-container">
                    <div className="chart-grid">
                        {[0, 25, 50, 75, 100].map(tick => (
                            <div key={tick} className="grid-line" style={{ left: `${tick}%` }}>
                                <span className="grid-label">{Math.round(maxTotal * tick / 100)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="chart-bars">
                        {chartData.map(data => (
                            <div key={data.learningArea} className="bar-row">
                                <div className="stacked-bar">
                                    {allStatuses.map(status => {
                                        const count = data.statuses[status] || 0;
                                        const percentage = data.total > 0 ? (count / maxTotal) * 100 : 0;

                                        if (count === 0) return null;

                                        return (
                                            <div
                                                key={status}
                                                className="bar-segment"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: statusColors[status] || '#94A3B8',
                                                }}
                                                title={`${status}: ${count}`}
                                            >
                                                {count > 0 && percentage > 5 && (
                                                    <span className="bar-label">{count}</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="total-label">{data.total}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Summary Statistics */}
            <div className="chart-summary">
                <div className="summary-card">
                    <div className="summary-value">{chartData.reduce((sum, d) => sum + d.total, 0)}</div>
                    <div className="summary-label">Total Resources</div>
                </div>
                <div className="summary-card">
                    <div className="summary-value">{learningAreas.length}</div>
                    <div className="summary-label">Learning Areas</div>
                </div>
                <div className="summary-card">
                    <div className="summary-value">{allStatuses.length}</div>
                    <div className="summary-label">Status Categories</div>
                </div>
                <div className="summary-card">
                    <div className="summary-value">
                        {chartData.reduce((sum, d) => sum + (d.statuses['For Evaluation'] || 0), 0)}
                    </div>
                    <div className="summary-label">For Evaluation</div>
                </div>
                <div className="summary-card">
                    <div className="summary-value">
                        {chartData.reduce((sum, d) => sum + (d.statuses['For ROR'] || 0), 0)}
                    </div>
                    <div className="summary-label">For ROR</div>
                </div>
            </div>
        </div>
    );
};

export default StatusChart;
