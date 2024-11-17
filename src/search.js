export { textHandler };
import { setupGrid } from "./arrange.js";
let searchText = "";

const container = document.getElementById("screenshots-container");

const highlightingFilter = (opts) =>
  `sepia(${opts.sepia}) saturate(${opts.saturation})`;
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
  }

  filterTabs(searchText);
};

const filterTabs = (text) => {
  const imgContainers = Array.from(
    container.querySelectorAll(".image-container"),
  );
  imgContainers.map((imgContainer) => {
    const img = imgContainer.querySelector("img");
    const wrapper = imgContainer.querySelector(".image-wrapper");
    const infoDiv = imgContainer.querySelector(".screenshot-info");
    const tabTitle = infoDiv.dataset["title"];
    const tabURL = infoDiv.dataset["url"];
    const baseFilter = img.dataset["filter"] ?? "";
    const saturation = text.length; // Math.sqrt was a bit too slow
    const sepia = 1 - 1 / text.length;
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
};
