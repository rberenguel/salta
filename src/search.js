export { textHandler };
import { setupGrid, uniformImages, globals } from "./arrange.js";

let searchText = "";
let formerPage = 0;

const container = document.getElementById("screenshots-container");

// This looked great when there was no dynamic filtering:
//
const highlightingFilter = (opts) =>
  `sepia(${opts.sepia}) saturate(${opts.saturation})`;

// Note that with dinamic filtering, other tabs no longer show in any way.
const boringFilter = (opts) =>
  `saturate(${1 / opts.saturation}) blur(${opts.blur}em)`;

const textHandler = (flags) => (event) => {
  if (event.key === "Control" || event.key === "Tab") {
    event.preventDefault();
    event.stopPropagation();
    flags.shouldHover = !flags.shouldHover;
  }
  if (event.key === "Backspace") {
    searchText = searchText.slice(0, -1);
  } else if (event.key === "Escape") {
    searchText = "";
    if (globals.currentPage === formerPage) {
      // Press Esc twice to go to the first page
      globals.currentPage = 0;
      formerPage = 0;
    } else {
      globals.currentPage = formerPage;
    }
  } else if (event.key === "Enter") {
    const imgContainers = container.querySelectorAll(".image-container");
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
    if (!formerPage) {
      formerPage = globals.currentPage;
    }
    globals.currentPage = 0;
  }

  filterTabs(searchText);
};

const filterTabs = (text) => {
  const imgContainers = Array.from(
    container.querySelectorAll(".image-container"),
  );
  const preSelecteds = container.querySelectorAll(
    '.image-container[data-selected="true"]',
  ).length;
  imgContainers.map((imgContainer) => {
    const img = imgContainer.querySelector("img");
    const wrapper = imgContainer.querySelector(".image-wrapper");
    const infoDiv = imgContainer.querySelector(".screenshot-info");
    const tabTitle = infoDiv.dataset["title"];
    const tabURL = infoDiv.dataset["url"];
    const baseFilter = img.dataset["filter"] ?? "";
    const saturation = text.length; // Math.sqrt was a bit too slow
    const sepia = 0.7 - 1 / text.length;
    const highlighted = highlightingFilter({
      sepia: sepia,
      saturation: saturation,
    });
    const blur = text.length * 0.1;
    const boring = boringFilter({ blur: blur, saturation: saturation });
    if (
      tabTitle.toLowerCase().includes(text.toLowerCase()) ||
      tabURL.toLowerCase().includes(text.toLowerCase())
    ) {
      img.style.filter = `${highlighted} ${baseFilter}`;
      imgContainer.dataset["hovers"] = true;
      imgContainer.dataset["selected"] = true;
      wrapper.classList.add("selected");
      const shadow = 2 / text.length;
      wrapper.style.filter = `drop-shadow(0 0 ${shadow}em #ca0)`;
    } else {
      img.style.filter = `${boring} ${baseFilter}`;
      imgContainer.dataset["hovers"] = false;
      imgContainer.dataset["selected"] = false;
      wrapper.classList.remove("selected");
      wrapper.style.filter = "";
    }
    if (!text) {
      img.style.filter = `${baseFilter}`;
      imgContainer.dataset["hovers"] = true;
      imgContainer.dataset["selected"] = true;
      wrapper.classList.remove("selected");
      wrapper.style.filter = "";
    }
  });
  const filterTextElement = document.getElementById("filter-text");
  if (text) {
    filterTextElement.textContent = text;
    filterTextElement.style.display = "block";
  } else {
    filterTextElement.style.display = "none";
  }
  setupGrid();
  const postSelecteds = container.querySelectorAll(
    '.image-container[data-selected="true"]',
  ).length;
  if (preSelecteds == postSelecteds) {
    return;
  }
  uniformImages();
};
