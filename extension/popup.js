document.getElementById("send").onclick = () => {
  const url = document.getElementById("url").value;

  chrome.runtime.sendNativeMessage(
    "com.swiftdl.host",
    { type: "download", url },
    (response) => {
      console.log(response);
    }
  );
};
