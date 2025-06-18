import { html } from "@reunmedia/astro-og-images";
import { deepmerge } from "deepmerge-ts";

// alternative layout backgroundImageAndLogo
// https://github.com/ReunMedia/astro-og-images/blob/main/playground/src/ogImageTemplates/backgroundImageAndLogo.ts

interface TemplateOptions {
  title: string;
  description: string;
  background?: {
    gradientFrom: "#4ca1af";
    gradientTo: "#c4e0e5";
    gradientDirection: "to bottom";
  };
}

const defaultOptions = {
  title: "",
  description: "",
  background: {
    gradientFrom: "#4ca1af",
    gradientTo: "#c4e0e5",
    gradientDirection: "to bottom",
  },
} satisfies TemplateOptions;

export default function ogTemplate(options: TemplateOptions) {
  const { title, description, background } = deepmerge(defaultOptions, options);

  const bgString = `linear-gradient(${background?.gradientDirection}, ${background?.gradientFrom}, ${background?.gradientTo})`;

  return html`
    <div
      style=${{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      fontSize: 16,
      gap: "2em",
      background: bgString,
    }}
    >
      <h1
        style=${{
      fontSize: "4em",
    }}
      >
        ${title}
      </h1>
      <p
        style=${{
      fontSize: "2em",
    }}
      >
        ${description}
      </p>
    </div>
  `;
}
