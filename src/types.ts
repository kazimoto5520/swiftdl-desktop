export interface SegmentInfo {
  start: number;
  end: number;
  downloaded: number;
  tempPath: string;
}

export interface DownloadMetadata {
  url: string;
  filename: string;
  totalSize: number;
  segments: SegmentInfo[];
  completed: boolean;
}

export interface DownloadHistoryItem {
  url: string;
  filename: string;
  date: string;
}