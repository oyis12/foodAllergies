# LabelKind

LabelKind is a small, private ingredient-label reader made for someone you care about. Choose ingredients you avoid, photograph a packaged-food label, and review possible matches found in its ingredient text.

## Why this exists

Ingredient lists are easy to overlook, especially when shopping quickly. LabelKind is designed as a second pair of eyes that makes a possible match easier to notice. It does not tell anyone that a food is safe.

## How it works

- Tesseract.js runs Tesseract's open-source LSTM neural-network OCR engine in the browser to extract text from a label photo.
- A transparent local word matcher compares that text with the avoid-list terms selected for this session.
- No account is required. The photo and selections are handled in the browser and are not uploaded by this app.
- Users can paste label text if they prefer or if OCR cannot read the photo.

## Run locally

```sh
npm install
npm run dev
```

The first OCR run downloads the OCR worker, WebAssembly runtime, and Tesseract English language data to the browser. The app itself does not send the label photo to an AI service.

## Safety note

This is an ingredient-text screening aid, not medical advice or a food-safety guarantee. OCR and keyword matching can miss text and ingredient variants. It cannot detect cross-contact, recipe changes, or undeclared ingredients. Always check the original package and contact the manufacturer when unsure, especially for severe allergies.

## Built with

React, Vite, Tesseract.js, and Lucide icons. Tesseract.js wraps the open-source Tesseract OCR engine in WebAssembly for browser use; Tesseract's LSTM neural-network recognizer is the AI that reads the label. The local-first approach keeps label photos on the device during recognition and avoids a closed AI API.

Tesseract.js: https://github.com/naptha/tesseract.js
Tesseract LSTM documentation: https://github.com/tesseract-ocr/tessdoc

