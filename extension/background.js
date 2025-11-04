chrome.contextMenus.create({
  id: "swiftdl-download-" + Date.now(),
  title: "Download with SwiftDL",
  contexts: ["link"]
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "swiftdl-download") {
    chrome.runtime.sendNativeMessage(
      "com.swiftdl.host",
      { type: "download", url: info.linkUrl },
      (response) => {
        console.log("Native host reply:", response);
      }
    );
  }
});
