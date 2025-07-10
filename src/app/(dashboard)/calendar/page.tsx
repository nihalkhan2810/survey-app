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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchSurveys();
  }, []);

  useEffect(() => {
    generateEvents();
  }, [surveys]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      days.push(<div key={`empty-${i}`} className={`${isMobile ? 'h-16' : 'h-28'} bg-gray-50 dark:bg-gray-900`}></div>);
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
          whileHover={{ scale: isMobile ? 1.01 : 1.02 }}
          onClick={() => setSelectedDate(isSelected ? null : dateStr)}
          className={`${isMobile ? 'h-16 p-1' : 'h-28 p-2'} border border-gray-200 dark:border-gray-700 cursor-pointer transition-all ${
            isSelected 
              ? 'bg-violet-50 border-violet-300 dark:bg-violet-900/20 dark:border-violet-600' 
              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
        >
          <div className="flex justify-between items-start h-full">
            <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium ${
              isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'
            }`}>
              {day}
            </span>
            {dayEvents.length > 0 && (
              <div className={`flex flex-col gap-1 flex-1 min-w-0 ${isMobile ? 'ml-0' : 'ml-1'}`}>
                {isMobile ? (
                  // Mobile: Only show dots for events
                  <div className="flex gap-1 justify-end">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className={`w-2 h-2 rounded-full ${
                          event.survey.status === 'active'
                            ? 'bg-green-500'
                            : event.survey.status === 'expired' || event.type === 'expired'
                            ? 'bg-red-500'
                            : 'bg-blue-500'
                        }`}
                        title={event.title}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="w-2 h-2 rounded-full bg-gray-400" title={`+${dayEvents.length - 3} more`} />
                    )}
                  </div>
                ) : (
                  // Desktop: Show event details
                  <>
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
                  </>
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
      <div className={`flex items-center ${
        isMobile ? 'flex-col gap-4' : 'justify-between'
      }`}>
        <div className={isMobile ? 'text-center' : ''}>
          <h1 className={`font-bold text-gray-900 dark:text-white ${
            isMobile ? 'text-2xl' : 'text-3xl'
          }`}>Survey Calendar</h1>
          <p className={`text-gray-500 dark:text-gray-400 mt-1 ${
            isMobile ? 'text-sm' : 'text-base'
          }`}>
            Track survey deadlines and reminders
          </p>
        </div>
        <div className={`flex items-center gap-2 ${
          isMobile ? 'justify-center flex-wrap' : ''
        }`}>
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

      <div className={`grid grid-cols-1 gap-6 ${
        isMobile ? '' : 'xl:grid-cols-4'
      }`}>
        {/* Calendar */}
        <div className={`bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 ${
          isMobile ? 'rounded-xl mobile-card' : 'xl:col-span-3 rounded-2xl'
        }`}>
          {/* Calendar Header */}
          <div className={`flex items-center justify-between border-b border-gray-200 dark:border-gray-700 ${
            isMobile ? 'p-4' : 'p-6'
          }`}>
            <h2 className={`font-semibold text-gray-900 dark:text-white ${
              isMobile ? 'text-lg' : 'text-xl'
            }`}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth('prev')}
                className={`hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${
                  isMobile ? 'p-2 min-h-[44px] min-w-[44px]' : 'p-2'
                }`}
              >
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className={`bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors ${
                  isMobile ? 'px-3 py-2 text-sm min-h-[44px]' : 'px-3 py-1 text-sm'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className={`hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${
                  isMobile ? 'p-2 min-h-[44px] min-w-[44px]' : 'p-2'
                }`}
              >
                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className={isMobile ? 'p-3' : 'p-6'}>
            <div className="grid grid-cols-7 gap-px mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className={`flex items-center justify-center font-medium text-gray-500 dark:text-gray-400 ${
                  isMobile ? 'h-8 text-xs' : 'h-10 text-sm'
                }`}>
                  {isMobile ? day.slice(0, 1) : day}
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
            <div className={`bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 ${
              isMobile ? 'rounded-xl p-4 mobile-card' : 'rounded-2xl p-6'
            }`}>
              <h3 className={`font-semibold text-gray-900 dark:text-white mb-4 ${
                isMobile ? 'text-base' : 'text-lg'
              }`}>
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
                    <div key={event.id} className={`border border-gray-200 dark:border-gray-600 rounded-lg ${
                      isMobile ? 'p-3' : 'p-4'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full mt-1 ${
                          event.survey.status === 'active'
                            ? 'bg-green-500'
                            : event.survey.status === 'expired' || event.type === 'expired'
                            ? 'bg-red-500'
                            : 'bg-blue-500'
                        }`}></div>
                        <div className="flex-1 space-y-2">
                          <h4 className={`font-semibold text-gray-900 dark:text-white ${
                            isMobile ? 'text-sm' : 'text-sm'
                          }`}>
                            {event.survey.topic}
                          </h4>
                          
                          {/* Survey Timeline */}
                          <div className={`space-y-1 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                            <div className={`flex gap-2 text-gray-600 dark:text-gray-400 ${
                              isMobile ? 'flex-col' : 'items-center'
                            }`}>
                              <span className={`font-medium ${isMobile ? '' : 'w-16'}`}>Opens:</span>
                              <span>{new Date(event.survey.start_date).toLocaleDateString('en-US', { 
                                month: 'short', day: 'numeric', year: 'numeric'
                              })} at {new Date(event.survey.start_date).toLocaleTimeString('en-US', {
                                hour: 'numeric', minute: '2-digit', hour12: true
                              })}</span>
                            </div>
                            <div className={`flex gap-2 text-gray-600 dark:text-gray-400 ${
                              isMobile ? 'flex-col' : 'items-center'
                            }`}>
                              <span className={`font-medium ${isMobile ? '' : 'w-16'}`}>Closes:</span>
                              <span>{new Date(event.survey.end_date).toLocaleDateString('en-US', { 
                                month: 'short', day: 'numeric', year: 'numeric'
                              })} at {new Date(event.survey.end_date).toLocaleTimeString('en-US', {
                                hour: 'numeric', minute: '2-digit', hour12: true
                              })}</span>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              event.survey.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : event.survey.status === 'expired' || event.type === 'expired'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            }`}>
                              {event.survey.status === 'active' && '✅ Currently Active'}
                              {(event.survey.status === 'expired' || event.type === 'expired') && '❌ Expired'}
                              {event.type === 'start' && '🚀 Opening Soon'}
                            </span>
                            
                            {/* Time until/since event */}
                            {(() => {
                              const now = new Date();
                              const startDate = new Date(event.survey.start_date);
                              const endDate = new Date(event.survey.end_date);
                              
                              if (event.survey.status === 'active') {
                                const timeLeft = endDate.getTime() - now.getTime();
                                const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
                                return (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` : 'Ending today'}
                                  </span>
                                );
                              } else if (event.type === 'start') {
                                const timeUntil = startDate.getTime() - now.getTime();
                                const daysUntil = Math.ceil(timeUntil / (1000 * 60 * 60 * 24));
                                return (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {daysUntil > 0 ? `Opens in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}` : 'Opens today'}
                                  </span>
                                );
                              } else if (event.survey.status === 'expired') {
                                const timeSince = now.getTime() - endDate.getTime();
                                const daysSince = Math.ceil(timeSince / (1000 * 60 * 60 * 24));
                                return (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Ended {daysSince} day${daysSince !== 1 ? 's' : ''} ago
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
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
                    <div key={event.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer border border-gray-100 dark:border-gray-700">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          event.survey.status === 'active'
                            ? 'bg-green-500'
                            : event.survey.status === 'expired' || event.type === 'expired'
                            ? 'bg-red-500'
                            : 'bg-blue-500'
                        }`}></div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {event.survey.topic}
                          </p>
                          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                            <div className="flex justify-between">
                              <span>Opens: {new Date(event.survey.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              <span>Closes: {new Date(event.survey.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                                event.survey.status === 'active'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                  : event.survey.status === 'expired' || event.type === 'expired'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              }`}>
                                {event.survey.status === 'active' && 'Active'}
                                {(event.survey.status === 'expired' || event.type === 'expired') && 'Expired'}
                                {event.type === 'start' && 'Upcoming'}
                              </span>
                              
                              {/* Quick time indicator */}
                              {(() => {
                                const now = new Date();
                                const startDate = new Date(event.survey.start_date);
                                const endDate = new Date(event.survey.end_date);
                                
                                if (event.survey.status === 'active') {
                                  const timeLeft = endDate.getTime() - now.getTime();
                                  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
                                  return <span>{daysLeft > 0 ? `${daysLeft}d left` : 'Ends today'}</span>;
                                } else if (event.type === 'start') {
                                  const timeUntil = startDate.getTime() - now.getTime();
                                  const daysUntil = Math.ceil(timeUntil / (1000 * 60 * 60 * 24));
                                  return <span>{daysUntil > 0 ? `${daysUntil}d until` : 'Opens today'}</span>;
                                }
                                return null;
                              })()}
                            </div>
                          </div>
                        </div>
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