import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import fs from "fs";
import { segmentedDownload } from "../downloader";
import { loadHistory, saveHistory } from "../utils";
import { startNativeHost } from "../native-host";
import { loadMetadata } from "../metadata";

const controllers: { [key: string]: AbortController } = {};

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

  startNativeHost(async (msg) => {
    console.log("[Native Host] Message:", msg);

    if (msg?.type === "download") {
      const { url, filename } = msg;
      console.log("[Native Host] Request download", url, filename);

      try {
        await segmentedDownload(url, filename);

        // ✅ Add to history
        const history = loadHistory();
        history.push({ url, filename, date: new Date().toISOString() });
        saveHistory(history);

        console.log("[Native Host] Download complete");
      } catch (err: any) {
        console.error("[Native Host] Download error:", err);
      }
    }
  });

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

ipcMain.handle("load-history", () => {
  try {
    return loadHistory();
  } catch (err: any) {
    console.error("[Main] Load history error:", err);
    return [];
  }
});

ipcMain.handle("pause-download", (e, filename) => {
  if (controllers[filename]) {
    controllers[filename].abort();
    console.log("Paused:", filename);
    return { success: true };
  }
  return { success: false };
});

ipcMain.handle("resume-download", async (e, filename) => {
  const meta = loadMetadata(filename);
  if (!meta) return { success: false, error: "No metadata" };

  await segmentedDownload(meta.url, filename);
  return { success: true };
});

ipcMain.handle("cancel-download", (e, filename) => {
  if (controllers[filename]) controllers[filename].abort();

  const meta = loadMetadata(filename);
  if (!meta) return { success: true };

  // delete metadata + temporary files
  meta.segments.forEach(seg => {
    if (fs.existsSync(seg.tempPath)) fs.unlinkSync(seg.tempPath);
  });

  // deleteMetadata(filename);

  return { success: true };
});


