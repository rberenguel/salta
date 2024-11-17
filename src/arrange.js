export { setupGrid, uniformImages };

const container = document.getElementById("screenshots-container");

const maxPerPage = 25;

let currentPage = 0;
let totalPages;
let lastInc = 0;
let numCols, numRows;

document.getElementById("lefty").addEventListener("mouseenter", (ev) => {
  const current = Date.now();
  if (current - lastInc < 500) {
    return;
  }
  currentPage -= 1;
  if (currentPage < 0) {
    currentPage = 0;
  }
  lastInc = current;
  setupGrid({ paging: true });
});

document.getElementById("righty").addEventListener("mouseenter", (ev) => {
  const current = Date.now();
  if (current - lastInc < 500) {
    return;
  }
  currentPage += 1;
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  lastInc = current;
  setupGrid({ paging: true });
});

function setupGrid(settings = {}) {
  // Translates depend on the row, and rows can change when tabs are closed
  // when pressing the red X icon.

  const allContainers = Array.from(
    container.querySelectorAll(".image-container"),
  );

  const info = document.getElementById("the-info");

  const selectedContainers = Array.from(
    container.querySelectorAll(".image-container"),
  ).filter((c) => c.dataset["selected"] === "true");
  let text = `${selectedContainers.length} tabs`;
  if (settings.paging) {
    text += `    <span style="font-size: 70%;">(page ${currentPage}/${totalPages})</span>`;
  }
  info.innerHTML = text;
  info.style.opacity = "1";
  setTimeout(() => {
    info.style.opacity = "0";
  }, 1000);
  let imgContainers;

  if (allContainers.length > maxPerPage) {
    imgContainers = selectedContainers;

    Array.from(container.querySelectorAll(".image-container"))
      .filter((c) => c.dataset["selected"] === "false")
      .map((c) => (c.style.display = "none"));
  } else {
    imgContainers = allContainers;
  }

  let imgIndex = 0;

  const total = imgContainers.length;
  totalPages = Math.trunc((total - 1) / maxPerPage);
  const adjusted = Math.min(maxPerPage, total);

  numCols = Math.ceil(Math.sqrt(adjusted));
  numRows = Math.ceil(adjusted / numCols);

  container.style.display = "grid";
  container.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;
  container.style.gridTemplateRows = `repeat(${numRows}, auto)`;

  for (let cont of imgContainers) {
    const page = Math.trunc(imgIndex / maxPerPage);
    const img = cont.querySelector("img");
    const wrapper = cont.querySelector(".image-wrapper");

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
    wrapper.dataset["page"] = page;
    if (page == currentPage) {
      cont.style.display = "";
    } else {
      cont.style.display = "none";
    }
    if (cont.dataset["selected"] === "false") {
      //cont.style.display = "none";
    }
    imgIndex++;
  }

  if (totalPages < 1) {
    document.getElementById("lefty").classList.add("nohover");
    document.getElementById("righty").classList.add("nohover");
  } else {
    document.getElementById("lefty").classList.remove("nohover");
    document.getElementById("righty").classList.remove("nohover");
  }
}

function uniformImages() {
  // Reset everything, wait a few milliseconds for it to redraw and then find the
  // most common image size. Then apply that to every wrapper.
  const vizConts = Array.from(
    container.querySelectorAll(".image-container"),
  ).filter((c) => c.style.display != "none");
  const imgs = vizConts.map((c) => c.querySelector("img"));
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
    const ih = window.innerHeight;
    const maxHeight = ih / numRows - numRows * 5; //(some sort of gap)
    const h = Math.min(maxHeight, mostCommonH);
    for (let wrap of wrappers) {
      wrap.style.width = `${mostCommonW}px`;
      wrap.style.height = `${h}px`;
    }
  }, 50);
}
