/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Persistent JSON store for RÖH operations
 */

import fs from 'fs';
import path from 'path';
import { Operation } from '../src/types/roh.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'operations.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export function getAllOperations(): Operation[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read operations store:', err);
    return [];
  }
}

export function getOperationById(id: string): Operation | null {
  const all = getAllOperations();
  return all.find(op => op.id === id) || null;
}

export function saveOperation(operation: Operation): Operation {
  ensureDataFile();
  const all = getAllOperations();
  const index = all.findIndex(op => op.id === operation.id);
  const updatedOp = {
    ...operation,
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    all[index] = updatedOp;
  } else {
    all.unshift(updatedOp);
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(all, null, 2), 'utf-8');
  return updatedOp;
}

export function deleteOperation(id: string): boolean {
  ensureDataFile();
  const all = getAllOperations();
  const filtered = all.filter(op => op.id !== id);
  if (filtered.length !== all.length) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    return true;
  }
  return false;
}

export function clearAllOperations(): void {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
}
