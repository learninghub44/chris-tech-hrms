import type { Metadata } from "next";
import hrmsIcon from "@/assets/hrms-icon.png";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "HRMS",
  description: "Role-based HR Management System",
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
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
        {children}
      </body>
    </html>
  );
}
