import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import hrmsIcon from "@/assets/hrms-icon.png";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import "./globals.css";

// Poppins is used site-wide — one rounded, geometric sans for headlines,
// body copy, and UI labels — for a clean, consistent look across every page.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-poppins",
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
        className={poppins.variable}
        suppressHydrationWarning={true}
      >
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
        {children}
      </body>
    </html>
  );
}
