const url = "quran.pdf";
const container = document.getElementById("pdf-viewer");
let pdfDoc = null;
const renderedPages = new Set();

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js";

pdfjsLib.getDocument(url).promise.then(pdf => {
  pdfDoc = pdf;
  renderPage(1);
  renderPage(2); // optional
});

function renderPage(num) {
  if (!pdfDoc || renderedPages.has(num) || num > pdfDoc.numPages) return;
  renderedPages.add(num);

  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale: 1.3 });
    const canvas = document.createElement("canvas");
    canvas.dataset.page = num;
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    container.appendChild(canvas);

    page.render({ canvasContext: context, viewport });
  });
}

// Lazy loading on scroll
container.addEventListener("scroll", () => {
  const canvases = container.getElementsByTagName("canvas");
  const lastCanvas = canvases[canvases.length - 1];
  if (lastCanvas && lastCanvas.offsetTop < container.scrollTop + container.clientHeight + 500) {
    renderPage(canvases.length + 1);
  }
});

// Load surah links
fetch('surah_links.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('surah-list').innerHTML = data;

    document.querySelectorAll('#surah-list a').forEach(link => {
      const href = link.getAttribute('href');
      const pageMatch = href.match(/#page=(\d+)/);
      if (pageMatch) link.dataset.page = pageMatch[1];

      link.addEventListener('click', e => {
        e.preventDefault();
        const page = parseInt(link.dataset.page);
        if (page) scrollToPage(page);
      });
    });

    // search filter
    document.getElementById('search').addEventListener('input', function() {
      const filter = this.value.toLowerCase();
      document.querySelectorAll('#surah-list a').forEach(link => {
        link.style.display = link.textContent.toLowerCase().includes(filter) ? 'block' : 'none';
      });
    });
  })
  .catch(err => console.error('Failed to load surah links:', err));

function scrollToPage(pageNum) {
  const canvas = container.querySelector(`canvas[data-page='${pageNum}']`);

  if (canvas) {
    canvas.scrollIntoView({ behavior: "smooth" });
  } else {
    renderPage(pageNum);

    const tryScroll = () => {
      const newCanvas = container.querySelector(`canvas[data-page='${pageNum}']`);
      if (newCanvas) {
        newCanvas.scrollIntoView({ behavior: "smooth" });
      } else {
        requestAnimationFrame(tryScroll);
      }
    };
    tryScroll();
  }
}
