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
  
  // Listen for progress updates
  onDownloadProgress: (callback: (data: any) => void) => {
    ipcRenderer.on("download-progress", (_event, data) => {
      callback(data);
    });
  },  

  loadHistory: () => ipcRenderer.invoke("load-history"),
})