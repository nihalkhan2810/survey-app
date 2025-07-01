'use client';

import { motion } from 'framer-motion';
import { Calendar, TrendingUp, MapPin, ChevronRight } from 'lucide-react';

interface EventStats {
  id: string;
  name: string;
  type: string;
  satisfaction: number;
  contentQuality: number;
  organizationRating: number;
  responses: number;
  attendees: number;
}

interface EventAnalyticsProps {
  events?: EventStats[];
  onEventClick?: (event: EventStats) => void;
}

const dummyEvents: EventStats[] = [
  {
    id: '1',
    name: 'AI & Future of Work Summit 2024',
    type: 'Technology Conference',
    satisfaction: 9.4,
    contentQuality: 9.2,
    organizationRating: 9.1,
    responses: 1247,
    attendees: 2850
  },
  {
    id: '2',
    name: 'Global Sustainability Forum',
    type: 'Industry Summit',
    satisfaction: 9.1,
    contentQuality: 9.5,
    organizationRating: 8.9,
    responses: 892,
    attendees: 1650
  },
  {
    id: '3',
    name: 'Medical Innovation Expo',
    type: 'Healthcare Conference',
    satisfaction: 9.6,
    contentQuality: 9.3,
    organizationRating: 9.4,
    responses: 634,
    attendees: 1230
  },
  {
    id: '4',
    name: 'Fintech Revolution Conference',
    type: 'Financial Technology',
    satisfaction: 8.9,
    contentQuality: 8.8,
    organizationRating: 9.0,
    responses: 543,
    attendees: 980
  },
  {
    id: '5',
    name: 'Creative Leadership Workshop',
    type: 'Executive Training',
    satisfaction: 9.2,
    contentQuality: 9.1,
    organizationRating: 8.8,
    responses: 298,
    attendees: 420
  }
];

export function EventAnalytics({ events = dummyEvents, onEventClick }: EventAnalyticsProps) {
  const getSatisfactionColor = (satisfaction: number) => {
    if (satisfaction >= 9) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    if (satisfaction >= 8) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    if (satisfaction >= 7) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20';
  };

  const getTopEvents = () => {
    return [...events]
      .sort((a, b) => b.satisfaction - a.satisfaction)
      .slice(0, 3);
  };

  const topEvents = getTopEvents();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg">
          <Calendar className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Premium Event Experience</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Industry-leading conferences & satisfaction metrics</p>
        </div>
      </div>

      <div className="space-y-4">
        {topEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onEventClick?.(event)}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-full text-sm font-bold">
                #{index + 1}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{event.name}</h4>
                  {index === 0 && <Calendar className="h-4 w-4 text-rose-500" />}
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{event.type}</p>
                  <span className="text-xs text-gray-400">•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">{event.attendees} attendees</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getSatisfactionColor(event.satisfaction)}`}>
                  <TrendingUp className="h-3 w-3" />
                  {event.satisfaction.toFixed(1)}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {event.responses} reviews
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {(events.reduce((sum, event) => sum + event.satisfaction, 0) / events.length).toFixed(1)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Satisfaction</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {(events.reduce((sum, event) => sum + event.contentQuality, 0) / events.length).toFixed(1)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Content Quality</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {(events.reduce((sum, event) => sum + event.organizationRating, 0) / events.length).toFixed(1)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Organization</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}