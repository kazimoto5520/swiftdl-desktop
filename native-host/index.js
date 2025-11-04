#!/usr/bin/env node

const fs = require("fs");

function sendResponse(obj) {
  const json = JSON.stringify(obj);
  const length = Buffer.alloc(4);
  length.writeUInt32LE(Buffer.byteLength(json), 0);
  process.stdout.write(Buffer.concat([length, Buffer.from(json)]));
}

process.stdin.on("data", async (data) => {
  try {
    const msg = JSON.parse(data.toString());
    console.log("[Native Host] Received:", msg);

    if (msg.type === "download") {
      // todo: integrate Electron IPC
      console.log("Download:", msg.url, msg.filename);
      sendResponse({ success: true });
    }

  } catch (err) {
    console.error("Parse error:", err);
    sendResponse({ success: false });
  }
});
