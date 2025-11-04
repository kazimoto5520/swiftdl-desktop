import fs from 'fs';
import path from 'path';
import { DownloadHistoryItem } from './types';

export function ensureDir(p: string) {
    if(!fs.existsSync(p)) {
        fs.mkdirSync(p, { recursive: true });
    }
}

export function readJSON<T>(file: string): T | null {
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as T;
}

export function writeJSON(file: string, data: any) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

export function fileExists(file: string) {
    return fs.existsSync(file);
}

export function log(...args: any[]) {
    console.log("[SwfitDL]", ...args);
}

export function loadHistory(): DownloadHistoryItem[] {
  if (!fs.existsSync(HISTORY_FILE)) return [];
  try {
    const data = fs.readFileSync(HISTORY_FILE, "utf-8");
    return JSON.parse(data) as DownloadHistoryItem[];
  } catch (err) {
    console.error("Failed to load history:", err);
    return [];
  }
}

export function saveHistory(history: DownloadHistoryItem[]) {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save history:", err);
  }
}

export const SWIFTDL_DIR = path.join(process.cwd(), 'downloads');
export const METADATA_DIR = path.join(SWIFTDL_DIR, 'metadata');
export const TEMP_DIR = path.join(SWIFTDL_DIR, 'temp');
export const HISTORY_FILE = path.join(SWIFTDL_DIR, "history.json");

ensureDir(SWIFTDL_DIR);
ensureDir(METADATA_DIR);
ensureDir(TEMP_DIR);