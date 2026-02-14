import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Guest, ConfirmationStatus } from '../lib/types';
import { CONFIRMATION_STATUSES, getStatusColor } from '../lib/types';
import { updateGuestStatus } from '../lib/firebase';

interface GuestRowProps {
  guest: Guest;
  index: number;
  onDelete: (guestId: string, guestName: string) => void;
}

type UpdateState = 'idle' | 'saving' | 'success' | 'error';

// Saving indicator component
const SavingIndicator: React.FC = () => (
  <span className="absolute -top-1 -right-1 flex h-3 w-3">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
  </span>
);

export const GuestRow: React.FC<GuestRowProps> = ({ guest, index, onDelete }) => {
  const [updateState, setUpdateState] = useState<UpdateState>('idle');
  const [localHandledBy, setLocalHandledBy] = useState(guest.handledBy || '');
  const [localPhone, setLocalPhone] = useState(guest.phone || '');
  const [localName, setLocalName] = useState(guest.name || '');
  const [localAge, setLocalAge] = useState(guest.age || '');
  const [localNotes, setLocalNotes] = useState(guest.notes || '');
  const [localFramework, setLocalFramework] = useState(guest.framework || '');
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync localHandledBy with guest.handledBy when it changes externally
  useEffect(() => {
    setLocalHandledBy(guest.handledBy || '');
  }, [guest.handledBy]);

  // Sync localPhone with guest.phone when it changes externally
  useEffect(() => {
    setLocalPhone(guest.phone || '');
  }, [guest.phone]);

  // Sync localName with guest.name when it changes externally
  useEffect(() => {
    setLocalName(guest.name || '');
  }, [guest.name]);

  // Sync localAge with guest.age when it changes externally
  useEffect(() => {
    setLocalAge(guest.age || '');
  }, [guest.age]);

  // Sync localNotes with guest.notes when it changes externally
  useEffect(() => {
    setLocalNotes(guest.notes || '');
  }, [guest.notes]);

  // Sync localFramework with guest.framework when it changes externally
  useEffect(() => {
    setLocalFramework(guest.framework || '');
  }, [guest.framework]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const handleUpdate = useCallback(async (updateFn: () => Promise<void>) => {
    setUpdateState('saving');
    try {
      await updateFn();
      setUpdateState('success');
      // Reset to idle after success animation
      successTimeoutRef.current = setTimeout(() => {
        setUpdateState('idle');
      }, 1500);
    } catch (error) {
      console.error('Error updating:', error);
      setUpdateState('error');
      // Reset to idle after error display
      successTimeoutRef.current = setTimeout(() => {
        setUpdateState('idle');
      }, 2000);
    }
  }, []);

  const handleAlreadySpokeChange = useCallback(async (checked: boolean) => {
    await handleUpdate(() => updateGuestStatus(guest.id, { alreadySpoke: checked }));
  }, [guest.id, handleUpdate]);

  const handleStatusChange = useCallback(async (status: ConfirmationStatus) => {
    await handleUpdate(() => updateGuestStatus(guest.id, { confirmationStatus: status }));
  }, [guest.id, handleUpdate]);

  const handleHandledByBlur = useCallback(async () => {
    if (localHandledBy !== guest.handledBy) {
      await handleUpdate(() => updateGuestStatus(guest.id, { handledBy: localHandledBy }));
    }
  }, [guest.id, guest.handledBy, localHandledBy, handleUpdate]);

  const handlePhoneBlur = useCallback(async () => {
    if (localPhone !== guest.phone) {
      await handleUpdate(() => updateGuestStatus(guest.id, { phone: localPhone }));
    }
  }, [guest.id, guest.phone, localPhone, handleUpdate]);

  const handleNameBlur = useCallback(async () => {
    if (localName !== guest.name) {
      await handleUpdate(() => updateGuestStatus(guest.id, { name: localName }));
    }
  }, [guest.id, guest.name, localName, handleUpdate]);

  const handleAgeBlur = useCallback(async () => {
    if (localAge !== guest.age) {
      await handleUpdate(() => updateGuestStatus(guest.id, { age: localAge }));
    }
  }, [guest.id, guest.age, localAge, handleUpdate]);

  const handleNotesBlur = useCallback(async () => {
    if (localNotes !== guest.notes) {
      await handleUpdate(() => updateGuestStatus(guest.id, { notes: localNotes }));
    }
  }, [guest.id, guest.notes, localNotes, handleUpdate]);

  const handleFrameworkBlur = useCallback(async () => {
    if (localFramework !== guest.framework) {
      await handleUpdate(() => updateGuestStatus(guest.id, { framework: localFramework }));
    }
  }, [guest.id, guest.framework, localFramework, handleUpdate]);

  const handleDeleteClick = useCallback(() => {
    onDelete(guest.id, guest.name);
  }, [guest.id, guest.name, onDelete]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate();
    return date.toLocaleString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Row class based on update state
  const getRowClass = () => {
    const baseClass = 'border-b border-slate-200/80 transition-all duration-300 group';
    switch (updateState) {
      case 'saving':
        return `${baseClass} row-saving animate-saving-pulse`;
      case 'success':
        return `${baseClass} row-success`;
      case 'error':
        return `${baseClass} row-error`;
      default:
        return `${baseClass} table-row-hover`;
    }
  };

  const isUpdating = updateState === 'saving';

  return (
    <tr className={getRowClass()}>
      {/* Row number with circular badge */}
      <td className="px-3 py-2.5 text-center">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-sm font-medium text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors duration-200">
          {index}
        </span>
      </td>

      {/* Name - Editable */}
      <td className="px-3 py-2.5">
        <div className="relative">
          {updateState === 'saving' && <SavingIndicator />}
          <input
            type="text"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={handleNameBlur}
            disabled={isUpdating}
            placeholder="הכנס שם..."
            className="w-full px-2 py-1 text-sm font-medium border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all duration-200 hover:border-slate-300 text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </td>

      {/* Phone */}
      <td className="px-3 py-2.5">
        <div className="relative">
          {updateState === 'saving' && <SavingIndicator />}
          <input
            type="text"
            value={localPhone}
            onChange={(e) => setLocalPhone(e.target.value)}
            onBlur={handlePhoneBlur}
            disabled={isUpdating}
            placeholder="הכנס טלפון..."
            className="w-full px-2 py-1 text-sm font-mono tracking-wide border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all duration-200 hover:border-slate-300 text-slate-700 placeholder:text-slate-400"
          />
        </div>
      </td>

      {/* Age - Editable */}
      <td className="px-3 py-2.5">
        <div className="relative">
          {updateState === 'saving' && <SavingIndicator />}
          <input
            type="text"
            value={localAge}
            onChange={(e) => setLocalAge(e.target.value)}
            onBlur={handleAgeBlur}
            disabled={isUpdating}
            placeholder="גיל..."
            className="w-full px-2 py-1 text-sm text-center border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all duration-200 hover:border-slate-300 text-slate-700 placeholder:text-slate-400"
          />
        </div>
      </td>

      {/* Gender */}
      <td className="px-3 py-2.5 text-center text-slate-700 text-sm">
        {guest.gender}
      </td>

      {/* Framework - Editable */}
      <td className="px-3 py-2.5">
        <div className="relative">
          {updateState === 'saving' && <SavingIndicator />}
          <input
            type="text"
            value={localFramework}
            onChange={(e) => setLocalFramework(e.target.value)}
            onBlur={handleFrameworkBlur}
            disabled={isUpdating}
            placeholder="מסגרת..."
            className="w-full px-2 py-1 text-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all duration-200 hover:border-slate-300 text-slate-700 placeholder:text-slate-400"
          />
        </div>
      </td>

      {/* Responsibility */}
      <td className="px-3 py-2.5 text-slate-700 text-sm">
        {guest.responsibility}
      </td>

      {/* Notes - Editable */}
      <td className="px-3 py-2.5">
        <div className="relative">
          {updateState === 'saving' && <SavingIndicator />}
          <textarea
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            onBlur={handleNotesBlur}
            disabled={isUpdating}
            placeholder="הערות..."
            rows={2}
            className="w-full px-2 py-1 text-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all duration-200 hover:border-slate-300 text-slate-600 placeholder:text-slate-400 resize-none min-w-[120px]"
          />
        </div>
      </td>

      {/* Already Spoke Checkbox */}
      <td className="px-3 py-2.5 text-center">
        <div className="relative inline-flex items-center justify-center">
          {updateState === 'saving' && <SavingIndicator />}
          <input
            type="checkbox"
            checked={guest.alreadySpoke}
            onChange={(e) => handleAlreadySpokeChange(e.target.checked)}
            disabled={isUpdating}
            className="w-5 h-5 text-indigo-600 rounded-lg border-slate-300 focus:ring-indigo-500/30 focus:ring-offset-0 cursor-pointer transition-all duration-200 hover:border-indigo-400"
          />
        </div>
      </td>

      {/* Status Select */}
      <td className="px-3 py-2.5">
        <div className="relative">
          {updateState === 'saving' && <SavingIndicator />}
          <select
            value={guest.confirmationStatus}
            onChange={(e) => handleStatusChange(e.target.value as ConfirmationStatus)}
            disabled={isUpdating}
            className={`w-full px-3 py-1.5 text-sm rounded-xl border-2 ${getStatusColor(guest.confirmationStatus)} cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200 hover:border-indigo-300`}
          >
            {CONFIRMATION_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </td>

      {/* Handled By Input */}
      <td className="px-3 py-2.5">
        <div className="relative">
          {updateState === 'saving' && <SavingIndicator />}
          <input
            type="text"
            value={localHandledBy}
            onChange={(e) => setLocalHandledBy(e.target.value)}
            onBlur={handleHandledByBlur}
            disabled={isUpdating}
            placeholder="הכנס שם..."
            className="w-full px-3 py-1.5 text-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all duration-200 hover:border-slate-300 placeholder:text-slate-400"
          />
        </div>
      </td>

      {/* Last Updated */}
      <td className="px-3 py-2.5 text-center text-xs text-slate-500 whitespace-nowrap">
        {formatDate(guest.lastUpdated)}
      </td>

      {/* Delete Button */}
      <td className="px-3 py-2.5 text-center">
        <button
          onClick={handleDeleteClick}
          disabled={isUpdating}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="מחק אורח"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </td>
    </tr>
  );
};

export default GuestRow;
