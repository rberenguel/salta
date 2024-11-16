const container = document.getElementById("screenshots-container");

let shouldHover = false;

document.addEventListener("DOMContentLoaded", function () {
  chrome.tabs.query({ currentWindow: true }, function (tabs) {
    const numTabs = tabs.length;

    const numCols = Math.ceil(Math.sqrt(numTabs));
    const numRows = Math.ceil(numTabs / numCols);

    container.style.display = "grid";
    container.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${numRows},   
   auto)`;

    let searchText = "";

    let placeholderish

    chrome.storage.local.get("screenshots", function (data) {
      if (data.screenshots) {
        document.addEventListener("keydown", (event) => {
          console.log(event);
          console.log(searchText);
          if (event.key === "Control" || event.key === "Tab") {
            event.preventDefault();
            event.stopPropagation();
            shouldHover = !shouldHover;
          }
          if (event.key === "Backspace") {
            searchText = searchText.slice(0, -1);
          } else if (event.key === "Escape") {
            searchText = "";
          } else if (event.key === "Enter") {
            const imgContainers =
              container.querySelectorAll(".image-container");
            const matches = Array.from(imgContainers).filter(
              (c) => c.dataset["selected"] === "true",
            );
            if (matches.length === 1) {
              const id = matches[0].dataset["tabId"];
              chrome.tabs.update(parseInt(id), { active: true });
              window.close();
            }
          } else if (event.key.length === 1) {
            searchText += event.key;
          }

          filterTabs(searchText);
        });
        const screenshots = data.screenshots;
        const tabIds = new Set(tabs.map((tab) => tab.id));
        let imgIndex = 0;
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
            const row = Math.floor(imgIndex / numCols);
            const col = imgIndex % numCols;
            const { screenshot } = screenshots[id];
            const img = document.createElement("img");
            const infoDiv = document.createElement("div");

            const imgContainer = document.createElement("div");
            imgContainer.dataset["hovers"] = true;
            imgContainer.dataset["tabId"] = id;
            imgContainer.classList.add("image-container");
            imgContainer.style.position = "relative";
            imgContainer.appendChild(img);

            const imgWrapper = document.createElement("div");
            imgWrapper.style.transition =
              "transform 0.5s ease, filter 0.5s ease";
            imgWrapper.style.position = "relative";
            imgContainer.appendChild(imgWrapper);

            imgWrapper.appendChild(img);

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
            img.style.transition = "transform 0.5s ease, filter 0.5s ease";
            img.style.position = "relative";

            img.addEventListener("mouseover", () => {
              if (imgContainer.dataset["hovers"] !== "true") {
                return;
              }
              if (!shouldHover) {
                return;
              }
              const siblings = Array.from(container.children).filter(
                (child) => child !== imgContainer,
              );
              siblings.forEach(
                (sibling) =>
                  (sibling.style.filter = "grayscale(1) blur(0.5em)"),
              );
              imgWrapper.style.transform = `scale(1.5) translate(${translateX}, ${translateY})`;
              imgWrapper.style.zIndex = "1000";

              imgContainer.style.zIndex = "1000";
            });

            imgContainer.addEventListener("mouseout", (ev) => {
              if (imgContainer.dataset["hovers"] !== "true") {
                return;
              }
              if (!shouldHover) {
                return;
              }
              if (ev.target === img) {
                console.log("Weird");
              }
              if (ev.target.closest(".screenshot-info")) {
                ev.stopPropagation();
                ev.preventDefault();
                console.log("Trying to stop");
                return;
              }
              imgWrapper.style.transform = "";
              imgWrapper.style.boxShadow = "";
              imgWrapper.style.zIndex = "";
              imgContainer.style.zIndex = "";
              const siblings = Array.from(container.children).filter(
                (child) => child !== imgContainer,
              );
              siblings.forEach((sibling) => (sibling.style.filter = ""));
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
                if(placeholderish){
                    img.src = placeholderish;
                    img.style.filter = "blur(8em)"
                } else {
                    img.src =
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";
                }
              
            } else {
                if(!placeholderish){
                    placeholderish = screenshot
                }
              img.src = screenshot;
            }
            img.alt = `Screenshot of ${url}`;
            img.classList.add("screenshot-thumbnail");

            imgWrapper.addEventListener("click", function () {
              chrome.tabs.update(parseInt(id), { active: true });
              window.close();
            });

            infoDiv.addEventListener("click", function () {
              chrome.tabs.update(parseInt(id), { active: true });
              window.close();
            });

            container.appendChild(imgContainer);
            imgIndex++;
          }

          for (const id in screenshots) {
            if (!tabIds.has(parseInt(id))) {
              delete screenshots[id];
            }
          }
          chrome.storage.local.set({ screenshots: screenshots });
        }
      }
    });
  });
});

function filterTabs(text) {
  const imgContainers = container.querySelectorAll(".image-container");
  imgContainers.forEach((imgContainer, index) => {
    const img = imgContainer.querySelector("img");
    const infoDiv = imgContainer.querySelector(".screenshot-info");
    const tabTitle = infoDiv.dataset["title"];
    const tabURL = infoDiv.dataset["url"];
    if (
      tabTitle.toLowerCase().includes(text.toLowerCase()) ||
      tabURL.toLowerCase().includes(text.toLowerCase())
    ) {
      img.style.filter = "";
      img.style.filter = "saturate(1.2)";
      imgContainer.dataset["hovers"] = true;
      imgContainer.dataset["selected"] = "true";
    } else {
      img.style.filter = "grayscale(1) blur(0.2em)";
      imgContainer.dataset["hovers"] = false;
      imgContainer.dataset["selected"] = "false";
    }
  });
  const filterTextElement = document.getElementById("filter-text");
  if (text) {
    filterTextElement.textContent = text;
    filterTextElement.style.display = "block";
  } else {
    filterTextElement.style.display = "none";
  }
}
