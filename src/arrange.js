export { setupGrid };

const container = document.getElementById("screenshots-container");

const maxPerPage = 25;

let currentPage = 0;
let totalPages;
let lastInc = 0;

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
  setupGrid();
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
  setupGrid();
});

function setupGrid() {
  // Translates depend on the row, and rows can change when tabs are closed
  // when pressing the red X icon.
  const imgContainers = Array.from(
    container.querySelectorAll(".image-container"),
  ).filter((c) => c.dataset["selected"] === "true");

  Array.from(container.querySelectorAll(".image-container"))
    .filter((c) => c.dataset["selected"] === "false")
    .map((c) => (c.style.display = "none"));

  let imgIndex = 0;

  const total = imgContainers.length;
  totalPages = Math.trunc(total / maxPerPage);
  const adjusted = (total % maxPerPage) + 1;

  const numCols = Math.ceil(Math.sqrt(adjusted));
  const numRows = Math.ceil(adjusted / numCols);

  container.style.display = "grid";
  container.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;
  container.style.gridTemplateRows = `repeat(${numRows},   
       auto)`;

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
    console.log(currentPage, imgIndex, page, page == currentPage);
    if (page == currentPage) {
      cont.style.display = "";
    } else {
      cont.style.display = "none";
    }
    console.log(cont.dataset);
    if (cont.dataset["selected"] === "false") {
      console.log("hiding");
      console.log(cont);
      cont.style.display = "none";
    }
    imgIndex++;
  }
}
