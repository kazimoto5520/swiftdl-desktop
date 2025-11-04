const urlInput = document.getElementById("url") as HTMLInputElement;
const filenameInput = document.getElementById("filename") as HTMLInputElement;
const btn = document.getElementById("downloadBtn") as HTMLButtonElement;
const progressDiv = document.getElementById("progress") as HTMLDivElement;

btn.addEventListener("click", async () => {
  console.log("[Renderer] Download button clicked");

  const url = urlInput.value;
  const filename = filenameInput.value;
  console.log("[Renderer] URL:", url, "Filename:", filename);

  if (!url || !filename) {
    alert("Enter URL and filename");
    return;
  }

  progressDiv.innerText = "Downloading...";

  try {
    const result = await (window as any).electronAPI.startDownload(url, filename);
    console.log("[Renderer] Received result:", result);

    if (result.success) {
      progressDiv.innerText = "✅ Download completed";
    } else {
      progressDiv.innerText = "❌ Error: " + result.error;
    }
  } catch (err) {
    console.error("[Renderer] Error calling startDownload:", err);
    progressDiv.innerText = "❌ Error: " + err;
  }
});
