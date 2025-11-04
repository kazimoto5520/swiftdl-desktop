import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { segmentedDownload } from "../downloader";
import { loadHistory, saveHistory } from "../utils";

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "../app/preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const rendererPath = path.join(__dirname, "../renderer/index.html");
  console.log("[Main] Loading renderer HTML at", rendererPath);
  win.loadFile(rendererPath);
}

app.whenReady().then(() => {
  console.log("[Main] App ready");
  createWindow();
});

// IPC to start download
ipcMain.handle("start-download", async (event, url: string, filename: string) => {
  console.log("[Main] start-download IPC received", url, filename);

  try {
    await segmentedDownload(url, filename);
    console.log("[Main] Download finished", filename);

    const history = loadHistory();
    history.push({ url, filename, date: new Date().toISOString() });
    saveHistory(history);
    console.log("[Main] History updated");

    return { success: true };
  } catch (err: any) {
    console.error("[Main] Download error:", err);
    return { success: false, error: err.message };
  }
});
