import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "FoodSense Review Workbench",
  description: "Admin review system for FoodSense OCR records",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
