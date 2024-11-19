import { textHandler } from "./search.js";
import { setupGrid, uniformImages } from "./arrange.js";
const container = document.getElementById("screenshots-container");

let flags = { shouldHover: false };

// Split out this event handler, eventually all will be out.
document.addEventListener("click", (ev) => {
  if (ev.target === document.body) {
    return;
  }
  if (ev.target.id === "screenshots-container") {
    return;
  }
  const cont = ev.target.closest(".image-container");
  const tabId = cont ? parseInt(cont.dataset["tabId"]) : undefined;
  if (ev.target.closest(".close")) {
    ev.stopPropagation();
    chrome.tabs.remove(tabId);
    cont.dataset["gone"] = true;
    setupGrid();
    uniformImages();
    return;
  }

  if (container) {
    chrome.tabs.update(tabId, { active: true });
    if (ev.metaKey) {
      return;
    }
    window.close();
  }
});

function debounce(func, delay) {
  let timeoutId;
  return function () {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, arguments);
    }, delay);
  };
}

window.addEventListener(
  "resize",
  debounce(() => {
    setupGrid();
    uniformImages();
  }, 250),
);

document.addEventListener("DOMContentLoaded", function () {
  chrome.tabs.query({ currentWindow: true }, function (tabs) {
    let placeholderish;
    chrome.storage.local.get("screenshots", function (data) {
      if (data.screenshots) {
        document.addEventListener("keydown", textHandler(flags));
        const screenshots = data.screenshots;
        const tabIds = new Set(tabs.map((tab) => tab.id));

        for (const tab of tabs) {
          const { id, url } = tab;
          if (tab.title === "chrome://newtab") {
            continue;
          }
          if (tab.url.startsWith("chrome://")) {
            continue;
          }
          if (url.endsWith("src/tabs.html")) {
            continue;
          }

          const screenshot = screenshots[id] && screenshots[id].screenshot;
          const img = document.createElement("img");
          img.classList.add("screenshot-thumbnail");
          const infoDiv = document.createElement("div");

          const imgContainer = document.createElement("div");
          imgContainer.dataset["selected"] = true;
          imgContainer.dataset["hovers"] = true;
          imgContainer.dataset["tabId"] = id;

          const urlBlocks = url
            .replace("https://", "")
            .replace("http://", "")
            .split("/");
          const domain = urlBlocks[0].split(".");
          const preTLD = domain.slice(0, domain.length - 1).map((b) => b[0]);
          const shortDomain =
            preTLD.join(".") + "." + domain[domain.length - 1];
          const rest = urlBlocks
            .slice(1, urlBlocks.length - 1)
            .map((b) => b[0])
            .join("/");
          let last = urlBlocks[urlBlocks.length - 1];
          const lastBlocks = last.split("?");
          last = lastBlocks.length > 1 ? lastBlocks[0] + "?(…)" : last;
          const shortURL = `${shortDomain}/${rest}/${last}`;
          const fancyHover = `${tab.title}\n${shortURL}`;
          imgContainer.dataset["title"] = fancyHover;
          imgContainer.classList.add("image-container");
          imgContainer.appendChild(img);

          const imgWrapper = document.createElement("div");
          imgWrapper.classList.add("image-wrapper");
          imgContainer.appendChild(imgWrapper);

          imgWrapper.appendChild(img);

          const closer = document.createElement("DIV");
          closer.classList.add("close");
          closer.innerHTML = "&#x274C;";
          closer.addEventListener("mouseover", (ev) => ev.stopPropagation());
          imgWrapper.appendChild(closer);

          img.addEventListener("mouseover", () => {
            if (imgContainer.dataset["hovers"] !== "true") {
              return;
            }
            if (!flags.shouldHover) {
              return;
            }
            const siblings = Array.from(container.children).filter(
              (child) => child !== imgContainer,
            );
            siblings.forEach((sibling) =>
              sibling.classList.add("gray-blurred"),
            );
            const tx = imgWrapper.dataset["tx"];
            const ty = imgWrapper.dataset["ty"];
            const windowWidth = window.innerWidth;

            const imageWidth = imgWrapper.offsetWidth;
            const scaleFactor = (windowWidth * 0.7) / imageWidth;

            imgWrapper.style.transform = `scale(${scaleFactor}) translate(${tx}, ${ty})`;

            //imgWrapper.style.transform = `scale(1.5) translate(${tx}, ${ty})`;
            imgWrapper.style.zIndex = "1000";
            imgContainer.style.zIndex = "1000";
          });

          imgContainer.addEventListener("mouseout", (ev) => {
            if (ev.toElement && ev.toElement.closest(".close")) {
              ev.stopPropagation();
              ev.preventDefault();
              return;
            }
            if (ev.toElement && ev.toElement.closest(".screenshot-info")) {
              ev.stopPropagation();
              ev.preventDefault();
              return;
            }
            imgWrapper.style.transform = "";
            imgWrapper.style.zIndex = "";
            imgContainer.style.zIndex = "";
            const siblings = Array.from(container.children).filter(
              (child) => child !== imgContainer,
            );
            siblings.forEach((sibling) =>
              sibling.classList.remove("gray-blurred"),
            );
            if (imgContainer.dataset["hovers"] !== "true") {
              return;
            }
            if (!flags.shouldHover) {
              return;
            }
          });
          let title = tab.title.slice(0, 30);
          if (tab.title.length > 32) {
            title += "&hellip;";
          }
          infoDiv.classList.add("screenshot-info");
          infoDiv.innerHTML = `<span title='${tab.title}'>${title}</span>`;
          infoDiv.dataset["url"] = url;
          infoDiv.dataset["title"] = tab.title;
          imgWrapper.appendChild(infoDiv);
          if (screenshot === undefined) {
            if (placeholderish) {
              img.src = placeholderish;
              img.dataset["filter"] = "blur(8em)";
              img.style.filter = img.dataset["filter"];
            } else {
              img.src =
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
            }
          } else {
            if (!placeholderish) {
              placeholderish = screenshot;
            }
            img.src = screenshot;
          }
          img.alt = `Screenshot of ${url}`;

          container.appendChild(imgContainer);

          for (const id in screenshots) {
            if (!tabIds.has(parseInt(id))) {
              delete screenshots[id];
            }
          }
          chrome.storage.local.set({ screenshots: screenshots });
        }
      }
      setTimeout(() => {
        setupGrid();
        uniformImages();
      }, 100);
    });
  });
});
