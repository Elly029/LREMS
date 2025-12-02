import React, { useEffect, useMemo, useState } from 'react';
import { bookApi } from '../services/bookService';
import { Book, Status } from '../types';
import * as XLSX from 'xlsx';
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
    const [rawBooks, setRawBooks] = useState<Book[]>([]);
    const [availableLearningAreas, setAvailableLearningAreas] = useState<string[]>([]);
    const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
    const [gradeLevels, setGradeLevels] = useState<number[]>([]);
    const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
    const [selectedArea, setSelectedArea] = useState<string>('all');
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [lastUpdated, setLastUpdated] = useState<string>('');

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
        'RTP': '#A3E635', // Lime
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
            setRawBooks(response.books);
            setAvailableLearningAreas(response.filters.availableLearningAreas || learningAreas);
            setAvailableStatuses(response.filters.availableStatuses || Object.keys(statusColors));
            setGradeLevels(response.filters.gradeLevels || []);
            setLastUpdated(new Date().toLocaleString());

            const chartDataArray = computeChartData(response.books);
            setChartData(chartDataArray);
        } catch (err) {
            console.error('Error fetching chart data:', err);
            setError('Failed to load chart data');
        } finally {
            setLoading(false);
        }
    };

    const filteredBooks = useMemo(() => {
        return rawBooks.filter(b => {
            const byGrade = selectedGrade === 'all' || b.gradeLevel === selectedGrade;
            const byArea = selectedArea === 'all' || b.learningArea === selectedArea;
            const byStatus = selectedStatuses.length === 0 || selectedStatuses.includes(b.status as unknown as string);
            return byGrade && byArea && byStatus;
        });
    }, [rawBooks, selectedGrade, selectedArea, selectedStatuses]);

    useEffect(() => {
        if (rawBooks.length === 0) return;
        const chartDataArray = computeChartData(filteredBooks);
        setChartData(chartDataArray);
    }, [filteredBooks]);

    const computeChartData = (books: Book[]): StatusData[] => {
        const dataByArea: { [key: string]: StatusData } = {};
        (availableLearningAreas.length ? availableLearningAreas : learningAreas).forEach(area => {
            dataByArea[area] = { learningArea: area, statuses: {}, total: 0 };
        });
        books.forEach(book => {
            const area = book.learningArea;
            const status = book.status as unknown as string;
            if (dataByArea[area]) {
                if (!dataByArea[area].statuses[status]) dataByArea[area].statuses[status] = 0;
                dataByArea[area].statuses[status]++;
                dataByArea[area].total++;
            }
        });
        return Object.values(dataByArea).sort((a, b) => b.total - a.total);
    };

    // Get all unique statuses from the data
    const getAllStatuses = (): string[] => {
        const statusSet = new Set<string>();
        chartData.forEach(area => {
            Object.keys(area.statuses).forEach(status => statusSet.add(status));
        });
        const fromData = Array.from(statusSet);
        return availableStatuses.length ? availableStatuses : fromData;
    };

    // Calculate the maximum total for scaling
    const maxTotal = Math.max(...chartData.map(d => d.total), 1);
    const totalsByStatus = useMemo(() => {
        const totals: Record<string, number> = {};
        chartData.forEach(area => {
            Object.entries(area.statuses).forEach(([status, count]) => {
                totals[status] = (totals[status] || 0) + count;
            });
        });
        return totals;
    }, [chartData]);

    const exportToExcel = () => {
        const rows: Array<{ LearningArea: string; Status: string; Count: number; TotalInArea: number }> = [];
        chartData.forEach(area => {
            Object.entries(area.statuses).forEach(([status, count]) => {
                rows.push({ LearningArea: area.learningArea, Status: status, Count: count, TotalInArea: area.total });
            });
        });
        const summaryRows = Object.entries(totalsByStatus).map(([status, count]) => ({ Status: status, Total: count }));
        const wb = XLSX.utils.book_new();
        const ws1 = XLSX.utils.json_to_sheet(rows);
        const ws2 = XLSX.utils.json_to_sheet(summaryRows);
        XLSX.utils.book_append_sheet(wb, ws1, 'ByAreaStatus');
        XLSX.utils.book_append_sheet(wb, ws2, 'Summary');
        XLSX.writeFile(wb, 'analytics.xlsx');
    };

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
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="refresh-button" onClick={fetchData} title="Refresh data">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                        </svg>
                    </button>
                    <button className="refresh-button" onClick={exportToExcel} title="Export to Excel">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16v16H4z" />
                            <path d="M8 8l8 8M16 8l-8 8" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div>
                    <label style={{ fontSize: '0.8rem', color: '#6B7280' }}>Grade</label>
                    <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="border border-gray-300 rounded-md px-2 py-1"
                    >
                        <option value="all">All</option>
                        {gradeLevels.map(gl => (
                            <option key={gl} value={gl}>{gl}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={{ fontSize: '0.8rem', color: '#6B7280' }}>Learning Area</label>
                    <select
                        value={selectedArea}
                        onChange={(e) => setSelectedArea(e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1"
                    >
                        <option value="all">All</option>
                        {(availableLearningAreas.length ? availableLearningAreas : learningAreas).map(area => (
                            <option key={area} value={area}>{area}</option>
                        ))}
                    </select>
                </div>
                <div style={{ minWidth: '240px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#6B7280' }}>Status</label>
                    <div className="border border-gray-300 rounded-md p-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.25rem' }}>
                        {getAllStatuses().map(status => (
                            <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedStatuses.includes(status)}
                                    onChange={(e) => {
                                        if (e.target.checked) setSelectedStatuses(prev => [...prev, status]);
                                        else setSelectedStatuses(prev => prev.filter(s => s !== status));
                                    }}
                                />
                                <span>{status}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div style={{ alignSelf: 'flex-end', color: '#9CA3AF', fontSize: '0.8rem' }}>Last updated: {lastUpdated || '-'}</div>
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
                                        const share = data.total > 0 ? Math.round((count / data.total) * 100) : 0;

                                        if (count === 0) return null;

                                        return (
                                            <div
                                                key={status}
                                                className="bar-segment"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: statusColors[status] || '#94A3B8',
                                                }}
                                                title={`${status}: ${count} (${share}%)`}
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
                    <div className="summary-label">Total Resources (All Grades)</div>
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

            {/* Totals by Status */}
            <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {getAllStatuses().map(status => {
                        const total = totalsByStatus[status] || 0;
                        if (total === 0) return null;
                        return (
                            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F3F4F6', borderRadius: 8, padding: '0.5rem 0.75rem' }}>
                                <div className="legend-color" style={{ backgroundColor: statusColors[status] || '#94A3B8' }} />
                                <span style={{ fontWeight: 600, color: '#1F2937' }}>{status}</span>
                                <span style={{ color: '#4B5563' }}>{total}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StatusChart;
