const container = document.getElementById("pdf-viewer");
let pdfDocs = {}; // store loaded PDFs
let renderedPages = {}; // track rendered pages per PDF

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js";

// Function to load a PDF by filename
function loadPDF(fileName) {
  if (pdfDocs[fileName]) return Promise.resolve(pdfDocs[fileName]);

  return pdfjsLib.getDocument(fileName).promise.then(pdf => {
    pdfDocs[fileName] = pdf;
    renderedPages[fileName] = new Set();
    return pdf;
  });
}

// Render a page from a specific PDF
function renderPage(fileName, pageNum) {
  if (!pdfDocs[fileName] || renderedPages[fileName].has(pageNum)) return;
  renderedPages[fileName].add(pageNum);

  pdfDocs[fileName].getPage(pageNum).then(page => {
    const viewport = page.getViewport({ scale: 1.3 });
    const canvas = document.createElement("canvas");
    canvas.dataset.file = fileName;
    canvas.dataset.page = pageNum;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext("2d");
    container.appendChild(canvas);
    page.render({ canvasContext: context, viewport });
  });
}

// Scroll to a specific PDF and page
function scrollToPage(fileName, pageNum) {
  loadPDF(fileName).then(() => {
    renderPage(fileName, pageNum);

    const tryScroll = () => {
      const canvas = container.querySelector(`canvas[data-file='${fileName}'][data-page='${pageNum}']`);
      if (canvas) canvas.scrollIntoView({ behavior: "smooth" });
      else requestAnimationFrame(tryScroll);
    };
    tryScroll();
  });
}

// Lazy loading on scroll
container.addEventListener("scroll", () => {
  const canvases = container.getElementsByTagName("canvas");
  if (!canvases.length) return;
  const lastCanvas = canvases[canvases.length - 1];
  const fileName = lastCanvas.dataset.file;
  const nextPage = parseInt(lastCanvas.dataset.page) + 1;

  if (pdfDocs[fileName] && nextPage <= pdfDocs[fileName].numPages) {
    renderPage(fileName, nextPage);
  }
});

// Load surah links
fetch('surah_links.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('surah-list').innerHTML = data;

    document.querySelectorAll('#surah-list a').forEach(link => {
      const match = link.getAttribute('href').match(/#file=(\d+)&page=(\d+)/);
      if (match) {
        const fileNum = parseInt(match[1]);
        const pageNum = parseInt(match[2]);

        // Map fileNum to your actual PDF filenames
        const fileMap = {
          1: 'quran1,2,3.pdf',
          2: 'quran4,5,6.pdf',
          3: 'quran7-15.pdf',
          4: 'quran16-35.pdf',
          5: 'quran36-55.pdf',
          6: 'quran56-96.pdf',
          7: 'quran97-114.pdf'
        };
        const fileName = fileMap[fileNum];

        link.addEventListener('click', e => {
          e.preventDefault();
          scrollToPage(fileName, pageNum);
        });
      }
    });

    // Search filter
    document.getElementById('search').addEventListener('input', function() {
      const filter = this.value.toLowerCase();
      document.querySelectorAll('#surah-list a').forEach(link => {
        link.style.display = link.textContent.toLowerCase().includes(filter) ? 'block' : 'none';
      });
    });
  })
  .catch(err => console.error('Failed to load surah links:', err));
