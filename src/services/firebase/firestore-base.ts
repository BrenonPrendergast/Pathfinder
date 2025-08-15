// Common Firestore utilities, cache management, and base functions

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  writeBatch,
  serverTimestamp,
  Timestamp,
  getCountFromServer
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import type { CareerFieldKey, Career } from '../types';

// Utility function to convert Firestore data to typed objects
export const convertTimestamps = (data: DocumentData): any => {
  const converted = { ...data };
  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    }
  });
  return converted;
};

// Simple in-memory cache for career field data to avoid repeated API calls
let fieldCareersCache: Record<CareerFieldKey, Career[]> = {} as Record<CareerFieldKey, Career[]>;
let allCareersCache: Career[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const isCacheValid = () => {
  return Date.now() - cacheTimestamp < CACHE_DURATION;
};

// Cache invalidation functions
export const clearCache = () => {
  fieldCareersCache = {} as Record<CareerFieldKey, Career[]>;
  allCareersCache = [];
  cacheTimestamp = 0;
};

export const getCacheTimestamp = () => cacheTimestamp;
export const setCacheTimestamp = (timestamp: number) => {
  cacheTimestamp = timestamp;
};

export const getFieldCareersCache = () => fieldCareersCache;
export const setFieldCareersCache = (cache: Record<CareerFieldKey, Career[]>) => {
  fieldCareersCache = cache;
};

export const getAllCareersCache = () => allCareersCache;
export const setAllCareersCache = (careers: Career[]) => {
  allCareersCache = careers;
};

// CSV utility functions
export const escapeCSVField = (field: string): string => {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
};

export const parseCSVRow = (row: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const nextChar = row[i + 1];
    
    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      i++; // skip next quote
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
};

// Common Firestore operations
export { 
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  writeBatch,
  serverTimestamp,
  getCountFromServer,
  db
};

export type { QueryDocumentSnapshot, DocumentData };