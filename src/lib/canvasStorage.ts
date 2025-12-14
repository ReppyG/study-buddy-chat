// Canvas localStorage management with simple obfuscation for token
// Note: This is basic obfuscation, not true encryption - for demo purposes

import type { CanvasConnection, CanvasData } from '@/types/canvas';

const CONNECTION_KEY = 'canvas_connection';
const DATA_KEY = 'canvas_data';
const DATA_EXPIRY_HOURS = 1; // Data expires after 1 hour

// Simple base64 obfuscation (not true encryption, but prevents casual viewing)
const obfuscate = (text: string): string => {
  return btoa(text.split('').reverse().join(''));
};

const deobfuscate = (text: string): string => {
  try {
    return atob(text).split('').reverse().join('');
  } catch {
    return '';
  }
};

export const saveConnection = (connection: CanvasConnection): void => {
  const toSave = {
    ...connection,
    apiToken: obfuscate(connection.apiToken),
  };
  localStorage.setItem(CONNECTION_KEY, JSON.stringify(toSave));
};

export const getConnection = (): CanvasConnection | null => {
  const stored = localStorage.getItem(CONNECTION_KEY);
  if (!stored) return null;
  
  try {
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      apiToken: deobfuscate(parsed.apiToken),
    };
  } catch {
    return null;
  }
};

export const clearConnection = (): void => {
  localStorage.removeItem(CONNECTION_KEY);
  localStorage.removeItem(DATA_KEY);
};

export const saveCanvasData = (data: Omit<CanvasData, 'expiresAt'>): void => {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + DATA_EXPIRY_HOURS);
  
  const toSave: CanvasData = {
    ...data,
    expiresAt: expiresAt.toISOString(),
  };
  localStorage.setItem(DATA_KEY, JSON.stringify(toSave));
};

export const getCanvasData = (): CanvasData | null => {
  const stored = localStorage.getItem(DATA_KEY);
  if (!stored) return null;
  
  try {
    const parsed: CanvasData = JSON.parse(stored);
    
    // Check if data has expired
    if (new Date(parsed.expiresAt) < new Date()) {
      localStorage.removeItem(DATA_KEY);
      return null;
    }
    
    return parsed;
  } catch {
    return null;
  }
};

export const updateSyncState = (syncState: Partial<CanvasData['syncState']>): void => {
  const data = getCanvasData();
  if (data) {
    data.syncState = { ...data.syncState, ...syncState };
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }
};
