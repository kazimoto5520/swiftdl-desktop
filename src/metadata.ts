import path from "path";
import { METADATA_DIR, readJSON, writeJSON } from "./utils";
import { DownloadMetadata } from "./types";

export function metadataPath(filename: string) {
    return path.join(METADATA_DIR, `${filename}.json`);
}

export function loadMetadata(filename: string): DownloadMetadata | null {
    return readJSON<DownloadMetadata>(metadataPath(filename));
}

export function saveMetadata(meta: DownloadMetadata) {
    writeJSON(metadataPath(meta.filename), meta);
}