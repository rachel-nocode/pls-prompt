import type { Metadata } from "next";
import "./globals.css";
import { MotionPreferences } from "@/components/motion-preferences";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: { default: "PLS PROMPT — From prompt to playable", template: "%s · PlsPrompt" },
  description: "Try working games and mini apps, collect their complete prompt recipes, and make them your own.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased"><MotionPreferences>{children}<Toaster position="bottom-right" /></MotionPreferences></body>
    </html>
  );
}
