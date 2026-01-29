/**
 * CSV Import Script for Guest Data
 *
 * This script imports guest data from a CSV file into Firebase Firestore.
 *
 * Usage:
 * 1. Place your CSV file in the scripts directory (or provide path as argument)
 * 2. Run: npm run import-csv scripts/guests.csv
 *
 * CSV Format expected (Hebrew headers):
 * מספר שורה,שם,טלפון,גיל,מגדר,מסגרת,באחריות,הערות
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, Timestamp } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBx8XKfpUB-AJaFWMPQR307ExCdDef7pf4',
  authDomain: 'marketing-check-list.firebaseapp.com',
  projectId: 'marketing-check-list',
  storageBucket: 'marketing-check-list.firebasestorage.app',
  messagingSenderId: '1036246187755',
  appId: '1:1036246187755:web:b8986c258c01630eb488ae',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface CsvRow {
  rowNumber: number;
  name: string;
  phone: string;
  age: string;
  gender: string;
  framework: string;
  responsibility: string;
  notes: string;
}

function parseCsv(csvContent: string): CsvRow[] {
  const lines = csvContent.trim().split('\n');
  const rows: CsvRow[] = [];

  // Find header row (skip empty rows at the beginning)
  let headerIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('שם') || line.includes('Column')) {
      headerIndex = i;
      break;
    }
  }

  // Process data rows (after header)
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle CSV with potential quoted fields
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    // Skip rows without valid data (need at least row number and name)
    const rowNum = parseInt(values[0]);
    const name = values[1]?.trim();
    if (!rowNum || !name) continue;

    rows.push({
      rowNumber: rowNum,
      name: name,
      phone: values[2] || '',
      age: values[3] || '',
      gender: values[4] || '',
      framework: values[5] || '',
      responsibility: values[6] || '',
      notes: values[7] || '',
    });
  }

  return rows;
}

async function importGuests(csvPath: string) {
  if (!fs.existsSync(csvPath)) {
    console.error(`Error: CSV file not found at ${csvPath}`);
    process.exit(1);
  }

  console.log(`Reading CSV file: ${csvPath}`);
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const guests = parseCsv(csvContent);

  console.log(`Found ${guests.length} guests to import`);

  // Firestore batch has a limit of 500 operations
  const batchSize = 500;
  const guestsCollection = collection(db, 'guests');
  let imported = 0;

  for (let i = 0; i < guests.length; i += batchSize) {
    const batch = writeBatch(db);
    const chunk = guests.slice(i, i + batchSize);

    for (const guest of chunk) {
      const docRef = doc(guestsCollection);
      batch.set(docRef, {
        ...guest,
        alreadySpoke: false,
        confirmationStatus: 'טרם טופל',
        handledBy: '',
        lastUpdated: Timestamp.now(),
      });
    }

    console.log(`Uploading batch ${Math.floor(i / batchSize) + 1}...`);
    await batch.commit();
    imported += chunk.length;
    console.log(`Imported ${imported}/${guests.length} guests`);
  }

  console.log(`Successfully imported ${guests.length} guests!`);
}

// Run the import
const csvPath = process.argv[2] || path.join(__dirname, 'guests.csv');
importGuests(csvPath)
  .then(() => {
    console.log('Import completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });
