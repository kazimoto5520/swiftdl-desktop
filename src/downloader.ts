import path from 'path';
import fs from 'fs';
import https from 'https';
import fetch from 'node-fetch';
import { loadMetadata, saveMetadata } from './metadata';
import { DownloadMetadata, SegmentInfo } from './types';
import { TEMP_DIR, log } from './utils';

const DEFAULT_SEGMENTS = 8;
const MAX_RETRIES = 3;

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// Get file size
async function getContentLength(url: string): Promise<number> {
  const res = await fetch(url, { method: 'HEAD', agent: httpsAgent });
  const len = res.headers.get('content-length');
  if (!len) throw new Error('Could not get content length from server');
  return Number(len);
}

// Terminal progress bar
function showProgress(completed: number, total: number) {
  const percent = (completed / total) * 100;
  const barLength = 30;
  const filled = Math.round(barLength * (percent / 100));
  const empty = barLength - filled;
  process.stdout.write(`\r[${"=".repeat(filled)}${"-".repeat(empty)}] ${percent.toFixed(1)}%`);
  if (percent >= 100) console.log();
}

// Download a single segment
async function downloadSegment(url: string, segment: SegmentInfo, meta: DownloadMetadata) {
  const { start, end, tempPath, downloaded } = segment;
  const from = start + downloaded;

  if (from >= end) return;

  const res = await fetch(url, {
    headers: { Range: `bytes=${from}-${end}` },
    agent: httpsAgent
  });

  if (!res.ok && res.status !== 206)
    throw new Error(`Segment request failed with status ${res.status}`);

  const file = fs.openSync(tempPath, 'a');
  const reader: any = res.body;

  for await (const chunk of reader) {
    fs.writeSync(file, chunk, 0, chunk.length, null);
    segment.downloaded += chunk.length;

    // Update total progress
    const totalDownloaded = meta.segments.reduce((a, s) => a + s.downloaded, 0);
    showProgress(totalDownloaded, meta.totalSize);

    // Save metadata periodically
    saveMetadata(meta);
  }

  fs.closeSync(file);
}

// Retry wrapper for segments
async function downloadSegmentWithRetry(url: string, segment: SegmentInfo, meta: DownloadMetadata) {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      await downloadSegment(url, segment, meta);
      return;
    } catch (err: any) {
      console.error(`\nSegment ${segment.tempPath} failed (${i + 1}/${MAX_RETRIES}): ${err.message}`);
      if (i === MAX_RETRIES - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i))); // exponential backoff
    }
  }
}

// Create metadata for new download
function createNewMetadata(url: string, filename: string, size: number, segments: number): DownloadMetadata {
  const segSize = Math.floor(size / segments);
  const segs: SegmentInfo[] = [];

  for (let i = 0; i < segments; i++) {
    const start = i * segSize;
    const end = i === segments - 1 ? size - 1 : (i + 1) * segSize - 1;
    segs.push({
      start,
      end,
      downloaded: 0,
      tempPath: path.join(TEMP_DIR, `${filename}.${i}.part`)
    });
  }

  return {
    url,
    filename,
    totalSize: size,
    segments: segs,
    completed: false
  };
}

// Merge all segments into final file
function merge(meta: DownloadMetadata) {
  const finalPath = path.join(process.cwd(), "downloads", meta.filename);
  const output = fs.openSync(finalPath, "w");

  for (const seg of meta.segments) {
    const data = fs.readFileSync(seg.tempPath);
    fs.writeSync(output, data);
    fs.unlinkSync(seg.tempPath); // cleanup temp file after merge
  }

  fs.closeSync(output);
  meta.completed = true;
  saveMetadata(meta);
  log(`✅ Merged into ${finalPath}`);
}

// Main download function
export async function segmentedDownload(url: string, filename: string, parts = DEFAULT_SEGMENTS) {
  let meta = loadMetadata(filename);

  if (!meta) {
    const size = await getContentLength(url);
    meta = createNewMetadata(url, filename, size, parts);
    saveMetadata(meta);
    log("✅ New download started");
  } else {
    log("✅ Resuming existing download");
  }

  // ✅ Parallel download of all segments
  await Promise.all(
    meta.segments.map(seg => downloadSegmentWithRetry(url, seg, meta))
  );

  merge(meta);
  log("✅ Download completed");
}
