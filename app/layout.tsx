import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "3D Booth Walkthrough",
  description: "A 3D Booth Walkthrough built with Next.js and Three.js",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="h-full">{children}</body>
    </html>
  );
}