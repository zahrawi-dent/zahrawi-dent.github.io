// Define category display data
const categoryData = {
  endodontics: {
    displayName: "Endodontics",
    description:
      "Comprehensive resources on root canal therapy, from diagnosis to post-treatment care. Follow the natural clinical workflow for a systematic approach to endodontic procedures.",
    icon: "stethoscope",
    subcategoryOrder: [
      "diagnosis",
      "access-preparation",
      "canal-preparation",
      "obturation",
      "post-treatment",
      "case-studies",
    ],
    subcategoryInfo: {
      diagnosis: {
        displayName: "Diagnosis & Assessment",
        icon: "diagnosis",
      },
      "access-preparation": {
        displayName: "Access Preparation",
        icon: "drill",
      },
      "canal-preparation": {
        displayName: "Canal Preparation & Cleaning",
        icon: "files",
      },
      obturation: {
        displayName: "Obturation Techniques",
        icon: "filling",
      },
      "post-treatment": {
        displayName: "Post-Treatment Care",
        icon: "aftercare",
      },
      "case-studies": {
        displayName: "Case Studies & Complications",
        icon: "case-study",
      },
    },
  },
  restorative: {
    displayName: "Restorative Dentistry",
    description: "Explore the world of restorative dentistry, including composite resins",
    icon: "heart",
    subcategoryOrder: [
      "isolation",
      "disease-classification",
      "non-surgical-therapy",
      "surgical-procedures",
      "periodontal-maintenance",
      "periodontal-medicine",
    ],
    subcategoryInfo: {
      isolation: {
        displayName: "Isolation Techniques",
        icon: "tooth-anatomy",
      },
      // Add subcategory details
    },
  },
  anatomy: {
    displayName: "Dental Anatomy",
    description: "Learn about the structure and functions of the human dental arch",
    icon: "tooth",
    subcategoryOrder: [
      "isolation",
      "disease-classification",
      "non-surgical-therapy",
      "surgical-procedures",
      "periodontal-maintenance",
      "periodontal-medicine",
    ],
    subcategoryInfo: {
      isolation: {
        displayName: "Isolation Techniques",
        icon: "tooth-anatomy",
      },
      // Add subcategory details
    },
  },
  // Add more categories as needed
};

const iconMap: Record<string, string> = {
  "tooth-anatomy": `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-12 w-12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M12 2C7.58 2 4 4.58 4 8c0 1.4.5 2.6 1.5 3.6.8.8 1.2 1.8 1.2 2.9v1c0 .8.2 1.5.6 2.2.4.7 1 1.3 1.7 1.7.7.4 1.5.6 2.3.6h1.4c.8 0 1.6-.2 2.3-.6.7-.4 1.3-1 1.7-1.7.4-.7.6-1.4.6-2.2v-1c0-1.1.4-2.1 1.2-2.9 1-.9 1.5-2.2 1.5-3.6 0-3.42-3.58-6-8-6z" />
    </svg>
  `,
  diagnosis: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-12 w-12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  `,
  drill: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-12 w-12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M6 3l15 5-5 2-10-3zM6 3v10l5 2M16 8v4l-5 2" />
    </svg>
  `,
  files: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-12 w-12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M14 3v4a1 1 0 001 1h4" />
      <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </svg>
  `,
  filling: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-12 w-12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M12 3v10l4 4M8 17l4-4" />
      <path d="M20 3v10l-4 4M4 17l4-4" />
    </svg>
  `,
  aftercare: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-12 w-12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7 7-7z" />
    </svg>
  `,
  "case-study": `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-12 w-12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  `,
  tooth: `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C7.03 2 3 6.03 3 10.99c0 3.78 2.67 7.99 7.99 10.01C16.31 19 21 14.99 21 10.99 21 6.03 16.97 2 12 2zm-.32 16c-3.1 0-5.55-3.26-5.55-6.62C6.13 7.04 8.58 4 11.68 4c3.1 0 5.55 3.04 5.55 7.38 0 3.36-2.45 6.62-5.55 6.62z"/>
        <path d="M13.79 7.45c-.4-1.23-1.18-1.23-1.58 0l-.37 1.14c-.07.22-.25.37-.46.37h-1.22c-1.28 0-1.82 1.04-1.01 1.85l.99.99c.18.18.26.44.2.69l-.38 1.19c-.4 1.23.6 2.23 1.81 1.81l1.19-.38c.25-.08.51 0 .69.2l.99.99c.81.81 1.85.27 1.85-1.01v-1.22c0-.21.15-.39.37-.46l1.14-.37c1.23-.4 1.23-1.18 0-1.58l-1.14-.37c-.22-.07-.37-.25-.37-.46V7.51c0-1.28-1.04-1.82-1.85-1.01l-.99.99c-.18.18-.44.26-.69.2l-1.19-.38z"/>
      </svg>
  `,
  sparkle: `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 3l2.3 4.68 5.17.75-3.74 3.65.88 5.13L12 15.4l-4.61 2.81.88-5.13-3.74-3.65 5.17-.75L12 3z"/>
        <path d="M19 14l-1.5-1.5L16 14l-1.5-1.5L13 14l-1.5-1.5L10 14H6v2h3.5L8 17.5 9.5 19 11 17.5 12.5 19 14 17.5 15.5 19 17 17.5 18.5 19 20 17.5V14z"/>
      </svg>
  `,
  microscope: `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
        <path d="M19.07 17.5l1.43-1.43-1.45-1.45-1.44 1.44 1.45 1.44zM4.93 6.5L3.5 7.93l1.45 1.45 1.44-1.44-1.46-1.44z"/>
        <path d="M7.93 16.5l-1.44 1.44 1.45 1.45 1.44-1.44-1.45-1.45z"/>
  `,
  heart: `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>

  `,
  stethoscope: `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 2h-2v2h-2v3c0 1.66-1.34 3-3 3s-3-1.34-3-3V4H7V2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H5V4h2v3c0 2.76 2.24 5 5 5s5-2.24 5-5V4h2v16zM15 7c0 1.66-1.34 3-3 3s-3-1.34-3-3V4h6v3zm2 9c-2.21 0-4-1.79-4-4h2c0 1.1.9 2 2 2s2-.9 2-2h2c0 2.21-1.79 4-4 4z"/>
      </svg>
  `,
};

export { categoryData, iconMap };
