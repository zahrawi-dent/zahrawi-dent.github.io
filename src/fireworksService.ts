// fireworksService.ts - A service to dynamically load fireworks CSS
let cssLoaded = false;

export const loadFireworksCSS = async () => {
  if (cssLoaded) return;

  try {
    // Create a link element
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'dist/styles/fireworks.css';

    // Add it to the head
    document.head.appendChild(link);

    // Wait for it to load
    await new Promise((resolve, reject) => {
      link.onload = resolve;
      link.onerror = reject;
    });

    cssLoaded = true;

  } catch (error) {
    console.error('Failed to load fireworks CSS:', error);
  }
};

export const isFireworksCSSLoaded = () => cssLoaded;
