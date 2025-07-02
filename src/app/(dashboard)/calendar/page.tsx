'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, ChevronLeft, ChevronRight, Clock, Users, AlertCircle } from 'lucide-react';

type Survey = {
  id: string;
  topic: string;
  start_date: string;
  end_date: string;
  reminder_dates?: string[];
  createdAt: string;
};

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  type: 'start' | 'end' | 'reminder' | 'expired';
  survey: Survey & { status?: 'active' | 'expired' | 'upcoming' };
};

export default function CalendarPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurveys();
  }, []);

  useEffect(() => {
    generateEvents();
  }, [surveys]);

  const fetchSurveys = async () => {
    try {
      const response = await fetch('/api/surveys');
      const data = await response.json();
      setSurveys(Array.isArray(data) ? data.filter((s: Survey) => s.start_date && s.end_date) : []);
    } catch (error) {
      console.error('Failed to fetch surveys:', error);
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  };

  const generateEvents = () => {
    const allEvents: CalendarEvent[] = [];
    const now = new Date();
    
    surveys.forEach(survey => {
      const startDate = new Date(survey.start_date);
      const endDate = new Date(survey.end_date);
      const isActive = now >= startDate && now <= endDate;
      const isExpired = now > endDate;
      
      // Only show one entry per survey - the most relevant status
      if (isActive) {
        // Show when the active survey will close
        allEvents.push({
          id: `${survey.id}-active`,
          title: `Active: ${survey.topic}`,
          date: survey.end_date.split('T')[0],
          type: 'end',
          survey: { ...survey, status: 'active' }
        });
      } else if (isExpired) {
        // Show expired surveys
        allEvents.push({
          id: `${survey.id}-expired`,
          title: `Expired: ${survey.topic}`,
          date: survey.end_date.split('T')[0],
          type: 'expired',
          survey: { ...survey, status: 'expired' }
        });
      } else {
        // Show upcoming surveys (not yet started)
        allEvents.push({
          id: `${survey.id}-upcoming`,
          title: `Upcoming: ${survey.topic}`,
          date: survey.start_date.split('T')[0],
          type: 'start',
          survey: { ...survey, status: 'upcoming' }
        });
      }
    });
    
    setEvents(allEvents);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getEventsForDate = (dateStr: string) => {
    return events.filter(event => event.date === dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-28 bg-gray-50 dark:bg-gray-900"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
      const dayEvents = getEventsForDate(dateStr);
      const isSelected = selectedDate === dateStr;
      const isToday = dateStr === formatDate(new Date());
      
      days.push(
        <motion.div
          key={day}
          whileHover={{ scale: 1.02 }}
          onClick={() => setSelectedDate(isSelected ? null : dateStr)}
          className={`h-28 p-2 border border-gray-200 dark:border-gray-700 cursor-pointer transition-all ${
            isSelected 
              ? 'bg-violet-50 border-violet-300 dark:bg-violet-900/20 dark:border-violet-600' 
              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
        >
          <div className="flex justify-between items-start h-full">
            <span className={`text-sm font-medium ${
              isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'
            }`}>
              {day}
            </span>
            {dayEvents.length > 0 && (
              <div className="flex flex-col gap-1 flex-1 ml-1 min-w-0">
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    className={`text-xs px-2 py-1 rounded-md truncate font-medium ${
                      event.survey.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : event.survey.status === 'expired' || event.type === 'expired'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}
                    title={event.title}
                  >
                    <div className="flex items-center gap-1">
                      <span className="flex-shrink-0">
                        {event.survey.status === 'active' ? '✅' : 
                         event.survey.status === 'expired' || event.type === 'expired' ? '❌' : 
                         event.type === 'start' ? '🚀' : '🔒'}
                      </span>
                      <span className="truncate">{event.survey.topic}</span>
                    </div>
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      );
    }
    
    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Survey Calendar</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track survey deadlines and reminders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span>Active</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
            <span>Expired</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
            <span>Upcoming</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="xl:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            <div className="grid grid-cols-7 gap-px mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-600">
              {renderCalendarDays()}
            </div>
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="space-y-4">
          {selectedDate ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              
              {getEventsForDate(selectedDate).length > 0 ? (
                <div className="space-y-3">
                  {getEventsForDate(selectedDate).map(event => (
                    <div key={event.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          event.survey.status === 'active'
                            ? 'bg-green-500'
                            : event.survey.status === 'expired' || event.type === 'expired'
                            ? 'bg-red-500'
                            : 'bg-blue-500'
                        }`}></div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {event.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {event.survey.status === 'active' && '✅ Survey is currently active'}
                            {(event.survey.status === 'expired' || event.type === 'expired') && '❌ Survey has expired'}
                            {event.type === 'start' && '🚀 Survey will go live'}
                            {event.type === 'reminder' && '📧 Send reminder email'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No events scheduled for this date.
                </p>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a Date
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Click on a calendar date to view events and deadlines.
                </p>
              </div>
            </div>
          )}

          {/* Upcoming Events */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Upcoming Events
            </h3>
            
            {events.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {events
                  .filter(event => new Date(event.date) >= new Date())
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 10)
                  .map(event => (
                    <div key={event.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                      <div className={`w-2 h-2 rounded-full ${
                        event.survey.status === 'active'
                          ? 'bg-green-500'
                          : event.survey.status === 'expired' || event.type === 'expired'
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {event.survey.topic}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(event.date).toLocaleDateString()} • 
                          {event.survey.status === 'active' && ' Active'}
                          {(event.survey.status === 'expired' || event.type === 'expired') && ' Expired'}
                          {event.type === 'start' && ' Opens'}
                          {event.type === 'reminder' && ' Reminder'}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No upcoming events. Create a survey with deadlines to see them here.
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}