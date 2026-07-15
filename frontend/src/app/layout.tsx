import type { Metadata } from "next";
import { Geist, IBM_Plex_Mono, Inter } from "next/font/google";
import hrmsIcon from "@/assets/hrms-icon.png";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import "./globals.css";

// Geist is the primary typeface for both headings and body copy, with Inter
// as an explicit fallback in the CSS font stack (see tailwind.config.ts).
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap"
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Chris Tech HRMS",
  description: "Multi-tenant HR management platform by Chris Tech.",
  icons: {
    icon: [
      {
        url: hrmsIcon.src,
        type: "image/png"
      }
    ]
  }
};

const lightOnlyThemePaths = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password"
];

const themeInitializer = `
(function () {
  var lightOnlyThemePaths = ${JSON.stringify(lightOnlyThemePaths)};
  var isLightOnlyThemePath = lightOnlyThemePaths.indexOf(window.location.pathname) !== -1;

  if (isLightOnlyThemePath) {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
    return;
  }

  var storedTheme = window.localStorage.getItem("${THEME_STORAGE_KEY}");
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  var theme = storedTheme === "dark" || storedTheme === "light"
    ? storedTheme
    : prefersDark ? "dark" : "light";

  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
})();
`;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${inter.variable} ${plexMono.variable}`}
        suppressHydrationWarning={true}
      >
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
        {children}
      </body>
    </html>
  );
}
