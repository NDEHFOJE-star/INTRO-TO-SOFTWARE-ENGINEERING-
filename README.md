# Lexi - Reading Helper & Accessibility Assistant

> A web-based reading assistant optimized specifically for individuals with dyslexia, visual fatigue, and reading difficulties.

## 🔗 Live Demo & Links
* **Live Application:** [View Live Website Here](https://lexi-reading-helper.netlify.app/) *(https://github.com/NDEHFOJE-star/TEAM-Lexi)*
* **Course:** ICT 2140 - Introduction to Software Engineering

---

## 📖 About the Project
Standard digital text formats often lack customization for readability, making reading tedious or inaccessible for users with dyslexia. **Lexi** is a client-side web application designed to bridge this gap. It allows users to instantly paste text, scan physical documents via camera, or upload PDFs, and read or listen to them using personalized visual configurations.

## ✨ Core Features
* **Dyslexia-Optimized Typography:** Includes support for specialized fonts (such as OpenDyslexic) and adjustable letter, word, and line spacing to reduce visual crowding.
* **Optical Character Recognition (OCR):** Built using **Tesseract.js** to extract and digitize text from uploaded images or camera captures instantly in the browser.
* **Document Parsing:** Integrated **PDF.js** support to parse and render text directly from uploaded PDF documents.
* **Text-to-Speech (TTS):** Powered by the browser's native Speech Synthesis API, allowing users to listen to passages with adjustable playback controls (Play, Pause, Stop, and speed adjustments).
* **High-Contrast Themes:** Custom color palettes (Cream, Light Blue, High Contrast) designed to minimize glare and visual fatigue.

## 🛠️ Technology Stack
* **Frontend:** HTML5, CSS3, Modern JavaScript (ES6+)
* **Processing Libraries:** Tesseract.js (OCR), PDF.js (Document Parsing)
* **Version Control & Hosting:** Git, GitHub, and Web Deployment Platforms

---

## 📂 Repository Structure
```text
├── index.html        # Main single-page application interface
├── style.css         # Styling, layout, and accessibility theme variables
├── script.js         # Core application logic, routing, OCR, and TTS handlers
└── README.md         # Project documentation
