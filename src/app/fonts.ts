import localFont from "next/font/local";

// Helvetica Neue: primary font (same files as bitworks).
export const helveticaNeue = localFont({
  src: [
    { path: "../../public/fonts/HelveticaNeue-UltraLight.woff2", weight: "300", style: "normal" },
    { path: "../../public/fonts/HelveticaNeue-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/HelveticaNeue-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/HelveticaNeue-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-helvetica",
  display: "swap",
});
