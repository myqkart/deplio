import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Deployment Manager",
    template: "%s · Deployment Manager",
  },
  description: "AWS Amplify deployment trigger manager",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0d1117",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-dvh font-sans antialiased">
        <TooltipProvider delay={300}>
          {children}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
