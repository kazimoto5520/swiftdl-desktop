import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  startDownload: async (url: string, filename: string) => {
    console.log("[Preload] startDownload called", url, filename);
    try {
      const result = await ipcRenderer.invoke("start-download", url, filename);
      console.log("[Preload] Received result from main:", result);
      return result;
    } catch (err) {
      console.error("[Preload] Error invoking IPC:", err);
      throw err;
    }
  },
  
  // Pause download
  pauseDownload: async (filename: string) => {
    console.log("[Preload] pauseDownload called", filename);
    try {
      const result = await ipcRenderer.invoke("pause-download", filename);
      return result;
    } catch (err) {
      console.error("[Preload] Error pausing download:", err);
      throw err;
    }
  },

  // Resume download
  resumeDownload: async (filename: string) => {
    console.log("[Preload] resumeDownload called", filename);
    try {
      const result = await ipcRenderer.invoke("resume-download", filename);
      return result;
    } catch (err) {
      console.error("[Preload] Error resuming download:", err);
      throw err;
    }
  },

  // Cancel download
  cancelDownload: async (filename: string) => {
    console.log("[Preload] cancelDownload called", filename);
    try {
      const result = await ipcRenderer.invoke("cancel-download", filename);
      return result;
    } catch (err) {
      console.error("[Preload] Error canceling download:", err);
      throw err;
    }
  },
  
  // Listen for progress updates
  onDownloadProgress: (callback: (data: any) => void) => {
    ipcRenderer.on("download-progress", (_event, data) => {
      callback(data);
    });
  },

  // Listen for status updates
  onDownloadStatus: (callback: (data: any) => void) => {
    ipcRenderer.on("download-status", (_event, data) => {
      callback(data);
    });
  },

  loadHistory: () => ipcRenderer.invoke("load-history"),
})