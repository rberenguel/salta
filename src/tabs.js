import { textHandler } from "./search.js";

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

          if (screenshots[id]) {
            const { screenshot } = screenshots[id];
            const img = document.createElement("img");
            img.classList.add("screenshot-thumbnail");
            const infoDiv = document.createElement("div");

            const imgContainer = document.createElement("div");
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
              uniformImages();
              addTranslates();
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
                  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";
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
          }

          for (const id in screenshots) {
            if (!tabIds.has(parseInt(id))) {
              delete screenshots[id];
            }
          }
          chrome.storage.local.set({ screenshots: screenshots });
        }
      }
      setTimeout(() => {
        addTranslates();
        uniformImages();
      }, 100);
    });
  });
});

function uniformImages() {
  // Reset everything, wait a few milliseconds for it to redraw and then find the
  // most common image size. Then apply that to every wrapper.
  const imgs = container.querySelectorAll(".image-container img");
  const wrappers = container.querySelectorAll(".image-wrapper");
  for (let wrapper of wrappers) {
    wrapper.style.width = "auto";
    wrapper.style.height = "auto";
  }
  setTimeout(() => {
    let ws = {};
    let hs = {};
    for (let img of imgs) {
      const cbr = img.getBoundingClientRect();
      const w = cbr.width;
      const h = cbr.height;
      ws[w] = (ws[w] || 0) + 1;
      hs[h] = (hs[h] || 0) + 1;
    }
    let maxWCount = 0;
    let mostCommonW = null;
    for (const w in ws) {
      if (ws[w] > maxWCount) {
        maxWCount = ws[w];
        mostCommonW = parseFloat(w);
      }
    }

    let maxHCount = 0;
    let mostCommonH = null;
    for (const h in hs) {
      if (hs[h] > maxHCount) {
        maxHCount = hs[h];
        mostCommonH = parseFloat(h);
      }
    }
    for (let wrap of wrappers) {
      wrap.style.width = `${mostCommonW}px`;
      wrap.style.height = `${mostCommonH}px`;
    }
  }, 50);
}

function addTranslates() {
  // Translates depend on the row, and rows can change when tabs are closed
  // when pressing the red X icon.
  const imgContainers = Array.from(
    container.querySelectorAll(".image-container"),
  );

  let imgIndex = 0;

  const numCols = Math.ceil(Math.sqrt(imgContainers.length));
  const numRows = Math.ceil(imgContainers.length / numCols);

  container.style.display = "grid";
  container.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;
  container.style.gridTemplateRows = `repeat(${numRows},   
     auto)`;

  for (let container of imgContainers) {
    const img = container.querySelector("img");
    const wrapper = container.querySelector(".image-wrapper");

    const row = Math.floor(imgIndex / numCols);
    const col = imgIndex % numCols;

    let translateX = 0;
    let translateY = 0;

    if (row === 0) {
      translateY = "40%";
    } else if (row === numRows - 1) {
      translateY = "-40%";
    }

    if (col === 0) {
      translateX = "40%";
    } else if (col === numCols - 1) {
      translateX = "-40%";
    }
    img.id = `img-${row}-${col}`;
    wrapper.dataset["tx"] = translateX;
    wrapper.dataset["ty"] = translateY;
    imgIndex++;
  }
}
