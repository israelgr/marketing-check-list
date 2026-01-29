import { Timestamp } from 'firebase/firestore';

export interface Guest {
  id: string;
  rowNumber: number;
  name: string;
  phone: string;
  age: string;
  gender: string;
  framework: string;
  responsibility: string;
  notes: string;
  alreadySpoke: boolean;
  confirmationStatus: ConfirmationStatus;
  handledBy: string;
  lastUpdated: Timestamp | null;
}

export type ConfirmationStatus =
  | 'נרשם'      // Confirmed
  | 'לא נרשם'   // Declined
  | 'אולי'      // Maybe
  | 'לא ענה'    // No Answer
  | 'טרם טופל'; // Not Yet Handled (default)

export const CONFIRMATION_STATUSES: { value: ConfirmationStatus; label: string; color: string }[] = [
  { value: 'טרם טופל', label: 'טרם טופל', color: 'status-pending' },
  { value: 'נרשם', label: 'נרשם', color: 'status-confirmed' },
  { value: 'לא נרשם', label: 'לא נרשם', color: 'status-declined' },
  { value: 'אולי', label: 'אולי', color: 'status-maybe' },
  { value: 'לא ענה', label: 'לא ענה', color: 'status-no-answer' },
];

export const getStatusColor = (status: ConfirmationStatus): string => {
  const statusItem = CONFIRMATION_STATUSES.find(s => s.value === status);
  return statusItem?.color || 'status-pending';
};
