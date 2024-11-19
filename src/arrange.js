export { setupGrid, uniformImages, globals };

const container = document.getElementById("screenshots-container");
const hiddenContainer = document.getElementById("hidden-screenshots-container");
const maxPerPage = 25;

let globals = {
  currentPage: 0,
  totalPages: null,
  numCols: null,
  numRows: null,
};

let lastInc = 0;

document.getElementById("lefty").addEventListener("mouseenter", (ev) => {
  const current = Date.now();
  if (current - lastInc < 500) {
    return;
  }
  globals.currentPage -= 1;
  if (globals.currentPage < 0) {
    globals.currentPage = 0;
  }
  lastInc = current;
  setupGrid({ paging: true });
});

document.getElementById("righty").addEventListener("mouseenter", (ev) => {
  const current = Date.now();
  if (current - lastInc < 500) {
    return;
  }
  globals.currentPage += 1;
  if (globals.currentPage > globals.totalPages) {
    globals.currentPage = globals.totalPages;
  }

  lastInc = current;
  setupGrid({ paging: true });
});

function setupGrid(settings = {}) {
  // Translates depend on the row, and rows can change when tabs are closed
  // when pressing the red X icon.

  const allContainers = Array.from(
    container.querySelectorAll(".image-container"),
  ).filter((c) => c.dataset["gone"] !== "true");

  const info = document.getElementById("the-info");

  const selectedContainers = Array.from(
    container.querySelectorAll(".image-container"),
  ).filter(
    (c) => c.dataset["selected"] === "true" && c.dataset["gone"] !== "true",
  );
  let text = `${selectedContainers.length} tabs`;
  if (settings.paging) {
    text += `    <span style="font-size: 70%;">(page ${
      globals.currentPage + 1
    }/${globals.totalPages + 1})</span>`;
  }
  info.innerHTML = text;
  info.style.opacity = "1";
  setTimeout(() => {
    info.style.opacity = "0";
  }, 1000);
  let imgContainers;
  Array.from(container.querySelectorAll(".image-container"))
    .filter((c) => c.dataset["gone"] === "true")
    .map((c) => {
      c.style.display = "none";
      c.style.opacity = 0;
    });
  if (allContainers.length > maxPerPage) {
    imgContainers = selectedContainers;

    Array.from(container.querySelectorAll(".image-container"))
      .filter((c) => c.dataset["selected"] === "false")
      .map((c) => {
        c.style.display = "none";
        c.style.opacity = 0;
      });
  } else {
    imgContainers = allContainers;
  }

  let imgIndex = 0;

  const total = imgContainers.length;
  globals.totalPages = Math.trunc((total - 1) / maxPerPage);
  const adjusted = Math.min(maxPerPage, total);

  globals.numCols = Math.ceil(Math.sqrt(adjusted));
  globals.numRows = Math.ceil(adjusted / globals.numCols);

  container.style.display = "grid";
  container.style.gridTemplateColumns = `repeat(${globals.numCols}, 1fr)`;
  container.style.gridTemplateRows = `repeat(${globals.numRows}, auto)`;
  hiddenContainer.style.display = "grid";
  hiddenContainer.style.gridTemplateColumns = `repeat(${globals.numCols}, 1fr)`;
  hiddenContainer.style.gridTemplateRows = `repeat(${globals.numRows}, auto)`;

  for (let cont of imgContainers) {
    const page = Math.trunc(imgIndex / maxPerPage);
    const img = cont.querySelector("img");
    const wrapper = cont.querySelector(".image-wrapper");

    const row = Math.floor(imgIndex / globals.numCols);
    const col = imgIndex % globals.numCols;

    let translateX = 0;
    let translateY = 0;

    if (row === 0) {
      translateY = "40%";
    } else if (row === globals.numRows - 1 && row != 1) {
      translateY = "-40%";
    }

    if (col === 0) {
      translateX = "40%";
    } else if (col === globals.numCols - 1) {
      translateX = "-40%";
    }
    img.id = `img-${row}-${col}`;
    wrapper.dataset["tx"] = translateX;
    wrapper.dataset["ty"] = translateY;
    wrapper.dataset["page"] = page;
    if (page == globals.currentPage) {
      cont.style.display = "";
      setTimeout(() => {
        wrapper.style.opacity = 1;
      }, 10);
    } else {
      wrapper.style.opacity = 0.3;
      cont.style.display = "none";
    }
    imgIndex++;
  }

  if (globals.totalPages < 1) {
    document.getElementById("lefty").classList.add("nohover");
    document.getElementById("righty").classList.add("nohover");
  } else {
    document.getElementById("lefty").classList.remove("nohover");
    document.getElementById("righty").classList.remove("nohover");
  }
}

function uniformImages() {
  // Reset everything, wait a few milliseconds for it to redraw and then find the
  // most common image size. Then apply that to every wrapper. Done in a separate
  // div that is hidden to reduce jiggling.

  const containers = container.querySelectorAll(".image-container");
  containers.forEach((div) => {
    const clonedDiv = div.cloneNode(true);
    hiddenContainer.appendChild(clonedDiv);
  });
  const vizConts = Array.from(
    hiddenContainer.querySelectorAll(".image-container"),
  ).filter((c) => c.style.display != "none");
  const wrappers = hiddenContainer.querySelectorAll(".image-wrapper");
  const vizWrappers = container.querySelectorAll(".image-wrapper");
  const imgs = vizConts.map((c) => c.querySelector("img"));
  for (let wrapper of wrappers) {
    wrapper.style.width = "auto";
    wrapper.style.height = "auto";
    wrapper.style.opacity = 0.3;
  }
  setTimeout(() => {
    let ws = {};
    let hs = {};
    for (let img of imgs) {
      const cbr = img.getBoundingClientRect();
      const w = Math.round(cbr.width);
      const h = Math.round(cbr.height);
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
    const maxHeight = ih / globals.numRows - globals.numRows * 5; //(some sort of gap)
    const h = Math.min(maxHeight, mostCommonH);
    setTimeout(() => {
      for (let wrap of vizWrappers) {
        wrap.style.width = `${mostCommonW + 4}px`;
        wrap.style.height = `${h + 4}px`;
      }
    }, 10);

    hiddenContainer.innerHTML = "";
  }, 100);
}
