/**
 * ocr.js
 * Handles: photo scanning, camera capture, OCR via Tesseract.js.
 */

const OcrModule = (() => {
  const imageInput = document.getElementById('imageInput');
  const cameraBtn = document.getElementById('cameraBtn');
  const captureBtn = document.getElementById('captureBtn');
  const video = document.getElementById('cameraStream');
  const imagePreview = document.getElementById('imagePreview');
  const imagePreviewWrap = document.getElementById('imagePreviewWrap');
  const runOcrBtn = document.getElementById('runOcrBtn');
  const progressWrap = document.getElementById('ocrProgress');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');

  let currentImageFile = null;
  let mediaStream = null;

  function setProgress(pct, msg) {
    progressWrap.classList.remove('hidden');
    progressFill.style.width = pct + '%';
    progressText.textContent = msg;
  }

  function hideProgress() {
    setTimeout(() => progressWrap.classList.add('hidden'), 1200);
  }

  function handleImageFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      App.showToast('Please select a valid image.', 'error');
      return;
    }
    currentImageFile = file;
    const url = URL.createObjectURL(file);
    imagePreview.src = url;
    imagePreviewWrap.classList.remove('hidden');
    runOcrBtn.disabled = false;
  }

  async function startCamera() {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      video.srcObject = mediaStream;
      video.classList.remove('hidden');
      captureBtn.classList.remove('hidden');
    } catch (err) {
      console.error(err);
      App.showToast('Camera access denied or unavailable.', 'error');
    }
  }

  function capturePhoto() {
    if (!mediaStream) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], 'capture.png', { type: 'image/png' });
      handleImageFile(file);
      stopCamera();
    }, 'image/png');
  }

  function stopCamera() {
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      mediaStream = null;
    }
    video.classList.add('hidden');
    captureBtn.classList.add('hidden');
  }

  async function runOcr(file) {
    setProgress(0, 'Loading OCR engine...');

    const { data } = await Tesseract.recognize(file, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const pct = Math.round((m.progress || 0) * 100);
          setProgress(pct, `Recognizing text... ${pct}%`);
        } else {
          setProgress(0, m.status);
        }
      },
    });

    setProgress(100, 'Done!');
    hideProgress();
    return data.text;
  }

  async function runOnFile(file) {
    return await runOcr(file);
  }

  function init(onProcess) {
    imageInput.addEventListener('change', (e) => {
      handleImageFile(e.target.files[0]);
    });

    cameraBtn.addEventListener('click', startCamera);
    captureBtn.addEventListener('click', capturePhoto);

    runOcrBtn.addEventListener('click', async () => {
      if (!currentImageFile) return;
      runOcrBtn.disabled = true;

      try {
        const raw = await runOcr(currentImageFile);
        if (!raw || !raw.trim()) {
          throw new Error('No text detected in image.');
        }
        onProcess(raw, 'ocr');
      } catch (err) {
        console.error(err);
        App.showToast(err.message || 'OCR failed.', 'error');
      } finally {
        runOcrBtn.disabled = false;
      }
    });
  }

  return { init, runOnFile };
})();