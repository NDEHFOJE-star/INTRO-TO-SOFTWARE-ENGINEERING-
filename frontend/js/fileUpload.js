/**
 * fileUpload.js
 * Handles: file selection, drag & drop, validation,
 * text extraction from .txt, .pdf, .docx, images.
 */

const FileUploadModule = (() => {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const filePreview = document.getElementById('filePreview');
  const fileName = document.getElementById('fileName');
  const fileSize = document.getElementById('fileSize');
  const removeBtn = document.getElementById('removeFileBtn');
  const processBtn = document.getElementById('processFileBtn');

  let selectedFile = null;

  const ACCEPTED = {
    'text/plain': 'txt',
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/msword': 'doc',
  };

  const MAX_SIZE_MB = 20;

  function validate(file) {
    if (!file) return 'No file selected.';

    const isImage = file.type.startsWith('image/');
    const isAcceptedDoc = ACCEPTED[file.type];

    if (!isImage && !isAcceptedDoc) {
      return `Unsupported file type: ${file.type || 'unknown'}`;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File too large. Max ${MAX_SIZE_MB}MB.`;
    }

    return null;
  }

  function showPreview(file) {
    selectedFile = file;
    fileName.textContent = file.name;
    fileSize.textContent = formatSize(file.size);
    filePreview.classList.remove('hidden');
    processBtn.disabled = false;
  }

  function hidePreview() {
    selectedFile = null;
    filePreview.classList.add('hidden');
    processBtn.disabled = true;
    fileInput.value = '';
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  async function extractText(file) {
    const type = file.type;

    if (type === 'text/plain') return await readTxt(file);
    if (type === 'application/pdf') return await readPdf(file);
    if (type.includes('word')) return await readDocx(file);
    if (type.startsWith('image/')) return await OcrModule.runOnFile(file);

    throw new Error('Unsupported file type for extraction.');
  }

  function readTxt(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read text file.'));
      reader.readAsText(file);
    });
  }

  async function readPdf(file) {
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(' ');
      fullText += pageText + '\n\n';
    }
    return fullText;
  }

  async function readDocx(file) {
    const buffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);
    const xml = await zip.file('word/document.xml').async('string');

    const text = xml
      .replace(/<w:p[^>]*>/g, '\n')
      .replace(/<w:tab[^>]*\/>/g, '\t')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");

    return text;
  }

  function init(onProcess) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      const err = validate(file);
      if (err) {
        App.showToast(err, 'error');
        hidePreview();
        return;
      }
      showPreview(file);
    });

    ['dragenter', 'dragover'].forEach((ev) => {
      dropZone.addEventListener(ev, (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach((ev) => {
      dropZone.addEventListener(ev, (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
      });
    });

    dropZone.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files[0];
      const err = validate(file);
      if (err) {
        App.showToast(err, 'error');
        hidePreview();
        return;
      }
      showPreview(file);
    });

    removeBtn.addEventListener('click', hidePreview);

    processBtn.addEventListener('click', async () => {
      if (!selectedFile) return;
      processBtn.disabled = true;
      processBtn.textContent = '⏳ Extracting...';

      try {
        const raw = await extractText(selectedFile);
        if (!raw || !raw.trim()) {
          throw new Error('No readable text found in file.');
        }
        onProcess(raw, 'file-upload');
      } catch (err) {
        console.error(err);
        App.showToast(err.message || 'Extraction failed.', 'error');
      } finally {
        processBtn.disabled = false;
        processBtn.textContent = '➡️ Extract & Process';
      }
    });
  }

  return { init };
})();