'use client';

import { Filter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface ResponsesFiltersProps {
  surveys: Array<{ id: string; title: string }>;
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedSurvey: string;
  setSelectedSurvey: (survey: string) => void;
  sortBy: 'date' | 'survey' | 'type' | 'response_count';
  setSortBy: (sort: 'date' | 'survey' | 'type' | 'response_count') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
}

export function ResponsesFilters({
  surveys,
  selectedType,
  setSelectedType,
  selectedSurvey,
  setSelectedSurvey,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder
}: ResponsesFiltersProps) {
  const responseModes = [
    { value: 'all', label: 'All Modes' },
    { value: 'email', label: 'Email' },
    { value: 'voice-extracted', label: 'Voice' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'survey', label: 'Survey' },
    { value: 'type', label: 'Mode' },
    { value: 'response_count', label: 'Response Volume' }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Mode Filter */}
      <div className="relative">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 pr-10 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent min-w-[140px]"
        >
          {responseModes.map(mode => (
            <option key={mode.value} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </select>
        <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Survey Filter */}
      <div className="relative">
        <select
          value={selectedSurvey}
          onChange={(e) => setSelectedSurvey(e.target.value)}
          className="appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 pr-10 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent min-w-[160px]"
        >
          <option value="all">All Surveys</option>
          {surveys.map(survey => (
            <option key={survey.id} value={survey.id}>
              {survey.title}
            </option>
          ))}
        </select>
        <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Sort Options */}
      <div className="flex gap-2">
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'survey' | 'type' | 'response_count')}
            className="appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 pr-10 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent min-w-[100px]"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>

        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="flex items-center justify-center w-10 h-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
        >
          {sortOrder === 'asc' ? (
            <ArrowUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ArrowDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
}