let screenshots = {};

chrome.storage.local.get("screenshots", function (data) {
  if (data.screenshots) {
    screenshots = data.screenshots;
  }
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
  setTimeout(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = activeInfo.tabId;
      if (!tabs) {
        return;
      }
      const currentUrl = tabs[0].url;

      chrome.tabs.captureVisibleTab(
        null,
        { format: "jpeg" },
        function (dataUrl) {
          screenshots[tabId] = { screenshot: dataUrl, url: currentUrl };
          chrome.storage.local.set({ screenshots: screenshots });
        },
      );
    });
  }, 100);
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  delete screenshots[tabId];
  chrome.storage.local.set({ screenshots: screenshots });
});

chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    if (request.message === "open-tab-switcher") {
      chrome.tabs.create({ url: "src/tabs.html" });
    }
  },
);
