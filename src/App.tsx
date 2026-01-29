import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Guest, ConfirmationStatus } from './lib/types';
import { subscribeToGuests, reconnectFirebase, addGuest, removeGuest } from './lib/firebase';
import SearchFilter from './components/SearchFilter';
import GuestTable from './components/GuestTable';
import AddGuestModal from './components/AddGuestModal';

function App() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ConfirmationStatus | 'all'>('all');
  const [frameworkFilter, setFrameworkFilter] = useState<string>('all');
  const [isOffline, setIsOffline] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [subscriptionKey, setSubscriptionKey] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToGuests(
      (updatedGuests, fromCache) => {
        setGuests(updatedGuests);
        setLoading(false);
        setError(null);
        setIsOffline(fromCache);
        if (!fromCache) {
          setLastSynced(new Date());
        }
      },
      (err) => {
        console.error('Firebase subscription error:', err);
        setError('שגיאה בהתחברות לבסיס הנתונים');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [subscriptionKey]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await reconnectFirebase();
      setSubscriptionKey((k) => k + 1);
    } catch (err) {
      console.error('Refresh failed:', err);
    }
    setIsRefreshing(false);
  }, []);

  const handleAddGuest = useCallback(async (guestData: Omit<Guest, 'id' | 'lastUpdated'>) => {
    await addGuest(guestData);
  }, []);

  const handleDeleteRequest = useCallback((guestId: string, guestName: string) => {
    setDeleteConfirm({ id: guestId, name: guestName });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (deleteConfirm) {
      try {
        await removeGuest(deleteConfirm.id);
      } catch (err) {
        console.error('Error deleting guest:', err);
      }
      setDeleteConfirm(null);
    }
  }, [deleteConfirm]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirm(null);
  }, []);

  // Calculate next row number for new guests
  const nextRowNumber = useMemo(() => {
    if (guests.length === 0) return 1;
    return Math.max(...guests.map((g) => g.rowNumber)) + 1;
  }, [guests]);

  const formatLastSynced = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Get unique frameworks for filter dropdown
  const frameworks = useMemo(() => {
    const uniqueFrameworks = [...new Set(guests.map((g) => g.framework).filter(Boolean))];
    return uniqueFrameworks.sort();
  }, [guests]);

  // Filter guests based on search and filters
  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        guest.name.toLowerCase().includes(searchLower) ||
        guest.phone.includes(searchTerm);

      // Status filter
      const matchesStatus =
        statusFilter === 'all' || guest.confirmationStatus === statusFilter;

      // Framework filter
      const matchesFramework =
        frameworkFilter === 'all' || guest.framework === frameworkFilter;

      return matchesSearch && matchesStatus && matchesFramework;
    });
  }, [guests, searchTerm, statusFilter, frameworkFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: filteredGuests.length,
      confirmed: filteredGuests.filter((g) => g.confirmationStatus === 'נרשם').length,
      declined: filteredGuests.filter((g) => g.confirmationStatus === 'לא נרשם').length,
      maybe: filteredGuests.filter((g) => g.confirmationStatus === 'אולי').length,
      noAnswer: filteredGuests.filter((g) => g.confirmationStatus === 'לא ענה').length,
      pending: filteredGuests.filter((g) => g.confirmationStatus === 'טרם טופל').length,
      spoke: filteredGuests.filter((g) => g.alreadySpoke).length,
    };
  }, [filteredGuests]);

  // Enhanced Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center animate-fade-in">
          {/* Animated Icon */}
          <div className="relative mx-auto w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full bg-indigo-100 animate-ping opacity-30"></div>
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
              <svg className="w-8 h-8 text-white animate-spin" style={{ animationDuration: '1.5s' }} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>

          {/* Loading Text */}
          <h2 className="text-xl font-semibold text-slate-800 mb-2">טוען נתונים</h2>
          <p className="text-slate-500 mb-6">מתחבר לבסיס הנתונים...</p>

          {/* Progress Bar */}
          <div className="w-48 h-1.5 bg-slate-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-shimmer"></div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 max-w-md mx-4 animate-fade-in">
          {/* Error Icon */}
          <div className="mx-auto w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-red-100">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          {/* Error Message */}
          <h2 className="text-xl font-semibold text-slate-800 mb-2">שגיאה בטעינת הנתונים</h2>
          <p className="text-slate-500 mb-6">{error}</p>

          {/* Retry Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            <svg className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isRefreshing ? 'מתחבר...' : 'נסה שוב'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Offline Banner */}
      {isOffline && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 text-center text-sm font-medium shadow-lg animate-fade-in">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            מצב לא מקוון - השינויים יסונכרנו כשהחיבור יחזור
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-4 py-6">
        {/* Enhanced Header */}
        <header className="mb-6 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Decorative Icon */}
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                  ניהול אישורי הגעה
                </h1>
                <p className="text-slate-500 mt-0.5">
                  מעקב אחר אישורי הגעה לאירוע
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-4">
              {/* Last Synced */}
              {lastSynced && (
                <span className="text-xs text-slate-400 hidden sm:block">
                  עודכן: {formatLastSynced(lastSynced)}
                </span>
              )}

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-white border-2 border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                title="רענן נתונים"
              >
                <svg
                  className={`w-4 h-4 text-indigo-600 ${isRefreshing ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="text-slate-700">{isRefreshing ? 'מרענן...' : 'רענן'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Search and Filter */}
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            frameworkFilter={frameworkFilter}
            onFrameworkFilterChange={setFrameworkFilter}
            frameworks={frameworks}
            stats={stats}
          />
        </div>

        {/* Guest Table */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <GuestTable
            guests={filteredGuests}
            onAddGuest={() => setShowAddModal(true)}
            onDeleteGuest={handleDeleteRequest}
          />
        </div>

        {/* Enhanced Footer */}
        <footer className="mt-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/60">
            {/* Guest Count */}
            {guests.length > 0 && (
              <p className="text-sm text-slate-600">
                מציג <span className="font-semibold text-indigo-600">{filteredGuests.length}</span> מתוך <span className="font-semibold">{guests.length}</span> אורחים
              </p>
            )}

            {/* Real-time Indicator */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isOffline ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOffline ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span>{isOffline ? 'מצב לא מקוון' : 'מחובר בזמן אמת'}</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Add Guest Modal */}
      <AddGuestModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddGuest}
        nextRowNumber={nextRowNumber}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={handleCancelDelete}
          />

          {/* Dialog */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all animate-fade-in">
              {/* Icon */}
              <div className="pt-6 pb-4 text-center">
                <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-red-100 mb-4">
                  <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">מחיקת אורח</h3>
                <p className="text-slate-600 px-6">
                  האם אתה בטוח שברצונך למחוק את <span className="font-semibold text-slate-800">{deleteConfirm.name}</span>?
                </p>
                <p className="text-sm text-slate-500 mt-1">פעולה זו לא ניתנת לביטול.</p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
                <button
                  onClick={handleCancelDelete}
                  className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  ביטול
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/30"
                >
                  מחק
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
