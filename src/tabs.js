import { textHandler } from "./search.js";
import { setupGrid, uniformImages } from "./arrange.js";
const container = document.getElementById("screenshots-container");

let flags = { shouldHover: false };

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
          imgContainer.classList.add("image-container");
          imgContainer.appendChild(img);

          const imgWrapper = document.createElement("div");
          imgWrapper.classList.add("image-wrapper");
          imgContainer.appendChild(imgWrapper);

          imgWrapper.appendChild(img);

          const closer = document.createElement("DIV");
          closer.classList.add("close");
          closer.innerHTML = "&#x274C;";
          closer.addEventListener("click", (ev) => {
            ev.stopPropagation();
            chrome.tabs.remove(id);
            imgContainer.parentElement.removeChild(imgContainer);
            // TODO(me) this needs the stable logic that I added for search to prevent redrawing.
            // TODO(me) shadow DOM instead?
            uniformImages();
            setupGrid();
          });
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
            imgWrapper.style.transform = `scale(1.5) translate(${tx}, ${ty})`;
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

          imgWrapper.addEventListener("click", function () {
            chrome.tabs.update(parseInt(id), { active: true });
            window.close();
          });

          infoDiv.addEventListener("click", function () {
            chrome.tabs.update(parseInt(id), { active: true });
            window.close();
          });

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
