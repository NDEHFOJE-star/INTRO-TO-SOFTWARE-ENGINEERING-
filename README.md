# Lexi Reading Helper

Lexi is a static reading helper with text entry, document and image extraction,
browser-based read-aloud, and accessibility controls.

## Deployment

Netlify publishes the `lexi` directory, as configured in `netlify.toml`. No package
installation or build command is required. The published directory contains
`index.html`, `style.css`, and `script.js` so the site opens at the root URL.

Read-aloud uses the voices available in the visitor's browser. Browsers without
speech synthesis can still use the reader and add passages. PDF, DOCX, and image
extraction load third-party libraries from CDNs and require internet access.
Camera access requires HTTPS and the visitor's permission.
