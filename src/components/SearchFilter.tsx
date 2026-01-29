import React from 'react';
import type { ConfirmationStatus } from '../lib/types';
import { CONFIRMATION_STATUSES } from '../lib/types';

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: ConfirmationStatus | 'all';
  onStatusFilterChange: (value: ConfirmationStatus | 'all') => void;
  frameworkFilter: string;
  onFrameworkFilterChange: (value: string) => void;
  frameworks: string[];
  stats: {
    total: number;
    confirmed: number;
    declined: number;
    maybe: number;
    noAnswer: number;
    pending: number;
    spoke: number;
  };
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  frameworkFilter,
  onFrameworkFilterChange,
  frameworks,
  stats,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 mb-4">
      {/* Filters Row */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Search Input */}
        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm font-medium text-slate-600 mb-1.5">
            חיפוש
          </label>
          <div className="relative">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="חפש לפי שם או טלפון..."
              className="w-full px-4 py-2.5 pr-10 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all duration-200 placeholder:text-slate-400"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Status Filter */}
        <div className="min-w-[160px]">
          <label className="block text-sm font-medium text-slate-600 mb-1.5">
            סטטוס
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as ConfirmationStatus | 'all')}
            className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all duration-200 cursor-pointer bg-white"
          >
            <option value="all">הכל</option>
            {CONFIRMATION_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Framework Filter */}
        <div className="min-w-[160px]">
          <label className="block text-sm font-medium text-slate-600 mb-1.5">
            מסגרת
          </label>
          <select
            value={frameworkFilter}
            onChange={(e) => onFrameworkFilterChange(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all duration-200 cursor-pointer bg-white"
          >
            <option value="all">הכל</option>
            {frameworks.map((framework) => (
              <option key={framework} value={framework}>
                {framework}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Row - Redesigned */}
      <div className="mt-5 pt-5 border-t border-slate-200/80">
        <div className="flex flex-wrap items-center gap-3">
          {/* Total - Special Treatment */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-md shadow-indigo-500/20">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="font-semibold text-lg">{stats.total}</span>
            <span className="text-indigo-100 text-sm">אורחים</span>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          {/* Confirmed */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold">{stats.confirmed}</span>
            <span className="text-emerald-600">נרשמים</span>
          </div>

          {/* Declined */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="font-semibold">{stats.declined}</span>
            <span className="text-red-600">לא נרשמים</span>
          </div>

          {/* Maybe */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{stats.maybe}</span>
            <span className="text-amber-600">אולי</span>
          </div>

          {/* No Answer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg border border-slate-200 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="font-semibold">{stats.noAnswer}</span>
            <span className="text-slate-500">לא ענה</span>
          </div>

          {/* Pending */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-500 rounded-lg border-2 border-dashed border-slate-300 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{stats.pending}</span>
            <span className="text-slate-400">טרם טופל</span>
          </div>

          {/* Spoke */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="font-semibold">{stats.spoke}</span>
            <span className="text-blue-600">דיברו איתם</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;
