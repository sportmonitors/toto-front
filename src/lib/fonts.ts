import { Inter, Roboto } from "next/font/google";

// Configure Inter font for English
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Configure Roboto font as fallback
export const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

// Vazir font configuration for Persian
// Since Vazir is not available in Google Fonts, we'll use a CDN approach
export const vazir = {
  className: "font-vazir",
  style: {
    fontFamily:
      'Vazir, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  css: `
    @import url('https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@v30.1.0/dist/font-face.css');
    
    .font-vazir {
      font-family: 'Vazir', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    /* Persian text styling */
    [lang="fa"] {
      font-family: 'Vazir', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      direction: rtl;
      text-align: right;
    }
    
    /* Ensure proper Persian number rendering */
    [lang="fa"] * {
      font-feature-settings: 'liga' 1, 'kern' 1;
    }
  `,
};
