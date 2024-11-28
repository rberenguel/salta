let screenshots = {};

chrome.storage.local.get("screenshots", function (data) {
  if (data.screenshots) {
    screenshots = data.screenshots;
  }
});

function captureScreenshot(tabId) {
  setTimeout(() => {
    chrome.tabs.captureVisibleTab(null, { format: "jpeg" }, function (dataUrl) {
      chrome.tabs.get(tabId, (tab) => {
        if (tab) {
          screenshots[tabId] = { screenshot: dataUrl, url: tab.url };
          chrome.storage.local.set({ screenshots: screenshots });
        }
      });
    });
  }, 100);
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.url) {
    captureScreenshot(tabId);
  }
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
  captureScreenshot(activeInfo.tabId);
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
