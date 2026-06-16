import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "Eminent Tutorials | Premium Study Materials & Notes",
    template: "%s | Eminent Tutorials"
  },
  description: "Access high-quality study materials, expert-verified notes, and interactive resources for academic excellence. Your all-in-one platform for Class 9, 10, 11, and 12 success.",
  keywords: ["study notes", "educational resources", "CBSE notes", "Class 10 notes", "exam preparation", "academic success"],
  authors: [{ name: "Eminent Tutorials Team" }],
  creator: "Eminent Tutorials",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://eminentutorials.com",
    title: "Eminent Tutorials | Premium Study Materials",
    description: "Expert-verified study notes and interactive learning resources for students.",
    siteName: "Eminent Tutorials",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eminent Tutorials | Premium Study Materials",
    description: "Expert-verified study notes and interactive learning resources for students.",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
