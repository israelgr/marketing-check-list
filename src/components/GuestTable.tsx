import React from 'react';
import type { Guest } from '../lib/types';
import GuestRow from './GuestRow';

interface GuestTableProps {
  guests: Guest[];
  onResetFilters?: () => void;
  onAddGuest: () => void;
  onDeleteGuest: (guestId: string, guestName: string) => void;
}

export const GuestTable: React.FC<GuestTableProps> = ({ guests, onResetFilters, onAddGuest, onDeleteGuest }) => {
  // Enhanced Empty State
  if (guests.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-12 text-center">
        {/* Empty State Icon */}
        <div className="mx-auto w-20 h-20 mb-6 flex items-center justify-center rounded-full bg-slate-100">
          <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>

        {/* Empty State Message */}
        <h3 className="text-xl font-semibold text-slate-800 mb-2">לא נמצאו אורחים</h3>
        <p className="text-slate-500 mb-6 max-w-sm mx-auto">
          לא נמצאו אורחים התואמים את הסינון הנוכחי. נסה לשנות את הסינון או לאפס את החיפוש.
        </p>

        {/* Reset Filters Button */}
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            אפס סינון
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
      {/* Add Guest Button */}
      <div className="px-4 py-3 border-b border-slate-200/60 flex justify-end">
        <button
          onClick={onAddGuest}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-200 hover:scale-105"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          הוסף אורח
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          {/* Enhanced Table Header */}
          <thead className="glass-header sticky top-0 z-10 border-b border-slate-200/80">
            <tr className="text-slate-600 text-xs uppercase tracking-wider">
              <th className="px-3 py-4 text-center font-semibold w-12">#</th>
              <th className="px-3 py-4 text-right font-semibold min-w-[120px]">שם</th>
              <th className="px-3 py-4 text-right font-semibold min-w-[100px]">טלפון</th>
              <th className="px-3 py-4 text-center font-semibold w-16">גיל</th>
              <th className="px-3 py-4 text-center font-semibold w-16">מגדר</th>
              <th className="px-3 py-4 text-right font-semibold min-w-[100px]">מסגרת</th>
              <th className="px-3 py-4 text-right font-semibold min-w-[100px]">באחריות</th>
              <th className="px-3 py-4 text-right font-semibold min-w-[100px]">הערות</th>
              <th className="px-3 py-4 text-center font-semibold w-20">דיברו איתו</th>
              <th className="px-3 py-4 text-center font-semibold min-w-[120px]">האם נרשם</th>
              <th className="px-3 py-4 text-center font-semibold min-w-[100px]">מי טיפל</th>
              <th className="px-3 py-4 text-center font-semibold w-24">עדכון אחרון</th>
              <th className="px-3 py-4 text-center font-semibold w-16">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {guests.map((guest, index) => (
              <GuestRow
                key={guest.id}
                guest={guest}
                index={index + 1}
                onDelete={onDeleteGuest}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GuestTable;
