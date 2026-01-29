import React, { useState } from 'react';

interface AddGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (guestData: {
    name: string;
    phone: string;
    age: string;
    gender: string;
    framework: string;
    responsibility: string;
    notes: string;
    rowNumber: number;
    alreadySpoke: boolean;
    confirmationStatus: 'טרם טופל';
    handledBy: string;
  }) => Promise<void>;
  nextRowNumber: number;
}

export const AddGuestModal: React.FC<AddGuestModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  nextRowNumber,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [framework, setFramework] = useState('');
  const [responsibility, setResponsibility] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setPhone('');
    setAge('');
    setGender('');
    setFramework('');
    setResponsibility('');
    setNotes('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('שם הוא שדה חובה');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onAdd({
        name: name.trim(),
        phone: phone.trim(),
        age: age.trim(),
        gender: gender.trim(),
        framework: framework.trim(),
        responsibility: responsibility.trim(),
        notes: notes.trim(),
        rowNumber: nextRowNumber,
        alreadySpoke: false,
        confirmationStatus: 'טרם טופל',
        handledBy: '',
      });
      resetForm();
      onClose();
    } catch (err) {
      console.error('Error adding guest:', err);
      setError('שגיאה בהוספת האורח. נסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg transform transition-all animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">הוספת אורח חדש</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Name - Required */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                שם <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="הכנס שם..."
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all"
                autoFocus
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">טלפון</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="הכנס טלפון..."
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all font-mono"
              />
            </div>

            {/* Age and Gender Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">גיל</label>
                <input
                  type="text"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="גיל..."
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">מגדר</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all bg-white"
                >
                  <option value="">בחר מגדר...</option>
                  <option value="זכר">זכר</option>
                  <option value="נקבה">נקבה</option>
                </select>
              </div>
            </div>

            {/* Framework */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">מסגרת</label>
              <input
                type="text"
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                placeholder="הכנס מסגרת..."
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all"
              />
            </div>

            {/* Responsibility */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">באחריות</label>
              <input
                type="text"
                value={responsibility}
                onChange={(e) => setResponsibility(e.target.value)}
                placeholder="הכנס באחריות..."
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">הערות</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="הכנס הערות..."
                rows={3}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all resize-none"
              />
            </div>

            {/* Row Number Info */}
            <div className="text-sm text-slate-500 text-center">
              מספר שורה: <span className="font-semibold text-indigo-600">{nextRowNumber}</span>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
            >
              ביטול
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  מוסיף...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  הוסף אורח
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddGuestModal;
