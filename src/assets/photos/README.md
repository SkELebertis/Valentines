How to add photos for the background carousel

- Place your photos in this same folder: `src/assets/photos/`.
- Edit the `photos.json` file to list the filenames in the order you want them shown, for example:
  [
    "photo1.jpg",
    "photo2.jpg"
  ]
- Recommended: resize photos to max width 1200px (or 2 MP) to keep the page fast on mobile.
- Filenames are referenced from the front-end using `/assets/photos/<filename>`.
- The slideshow will automatically start if `photos.json` exists and contains at least one filename.
