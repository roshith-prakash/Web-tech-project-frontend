import { useState, useEffect } from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import dayjs from "dayjs";

interface DateRange {
    startDate: string;
    endDate: string;
}

interface DatePickerProps {
    value: string;
    onChange: (date: string) => void;
    minDate?: string;
    blockedDates?: DateRange[];
    placeholder?: string;
    label?: string;
    required?: boolean;
    className?: string;
}

const DatePicker = ({
    value,
    onChange,
    minDate,
    blockedDates = [],
    placeholder = "Select date",
    label,
    required = false,
    className = "",
}: DatePickerProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Helper function to format date as YYYY-MM-DD in local time
    const formatDateToString = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.date-picker-container')) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Initialize current month based on value or today
    useEffect(() => {
        if (value) {
            setCurrentMonth(new Date(value));
        }
    }, [value]);

    const isDateBlocked = (date: Date) => {
        const dateString = formatDateToString(date);

        // Check if date is before minimum date
        if (minDate && dateString < minDate) {
            return true;
        }

        // Debug logging
        console.log("🚫 Checking if date is blocked:", {
            date: dateString,
            blockedDatesCount: blockedDates.length,
            blockedDates: blockedDates
        });

        // Check if date falls within any blocked range
        return blockedDates.some((range) => {
            if (!range || !range.startDate || !range.endDate) {
                console.log("❌ Invalid range:", range);
                return false;
            }

            // Handle different date formats more robustly
            let startDate: Date;
            let endDate: Date;

            // If the dates are already strings (ISO format from JSON)
            if (typeof range.startDate === 'string') {
                startDate = new Date(range.startDate);
                endDate = new Date(range.endDate);
            } else {
                // If they're Date objects, use them directly
                startDate = new Date(range.startDate);
                endDate = new Date(range.endDate);
            }

            // Ensure we have valid dates
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                console.log("❌ Invalid dates in range:", { startDate, endDate, range });
                return false;
            }

            const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const isBlocked = checkDate >= startDate && checkDate <= endDate;

            console.log("📅 Date range check:", {
                checkDate: checkDate.toISOString().split('T')[0],
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                isBlocked
            });

            return isBlocked;
        });
    };

    const formatDisplayDate = (dateString: string) => {
        if (!dateString) return placeholder;
        return dayjs(dateString).format('ddd, DD/MM/YYYY');
    };

    const handleDateSelect = (date: Date) => {
        if (!isDateBlocked(date)) {
            const dateString = formatDateToString(date);
            onChange(dateString);
            setIsOpen(false);
        }
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1);
            } else {
                newDate.setMonth(prev.getMonth() + 1);
            }
            return newDate;
        });
    };

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        // Create array of dates for the calendar
        const calendarDays = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            calendarDays.push(null);
        }

        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            calendarDays.push(new Date(year, month, day));
        }

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        return (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 min-w-80">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        type="button"
                        onClick={() => navigateMonth('prev')}
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <BsChevronLeft className="w-4 h-4" />
                    </button>
                    <h3 className="text-lg font-semibold">
                        {monthNames[month]} {year}
                    </h3>
                    <button
                        type="button"
                        onClick={() => navigateMonth('next')}
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <BsChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map(day => (
                        <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((date, index) => {
                        if (!date) {
                            return <div key={index} className="h-10"></div>;
                        }

                        const isBlocked = isDateBlocked(date);
                        const isSelected = value === formatDateToString(date);
                        const isToday = date.toDateString() === new Date().toDateString();

                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleDateSelect(date)}
                                disabled={isBlocked}
                                className={`
                  h-10 w-10 text-sm rounded-lg transition-colors
                  ${isSelected
                                        ? 'bg-blue-600 text-white'
                                        : isBlocked
                                            ? 'bg-red-100 text-red-400 cursor-not-allowed line-through'
                                            : isToday
                                                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                                : 'hover:bg-gray-100'
                                    }
                `}
                                title={isBlocked ? 'Date not available' : ''}
                            >
                                {date.getDate()}
                            </button>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                                <span>Selected</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-red-100 rounded"></div>
                                <span>Unavailable</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-blue-100 rounded"></div>
                                <span>Today</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`date-picker-container relative ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-left bg-white ${!value ? 'text-gray-500' : 'text-gray-900'
                    }`}
            >
                {formatDisplayDate(value)}
            </button>

            {isOpen && renderCalendar()}
        </div>
    );
};

export default DatePicker;