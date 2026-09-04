import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: { default: "PlsPrompt — Prompts that actually work", template: "%s · PlsPrompt" },
  description: "A human-verified directory of AI prompts, practical workflows, and short lessons that explain why they work.",
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
      <body className="antialiased">{children}<Toaster richColors position="bottom-right" /></body>
    </html>
  );
}
