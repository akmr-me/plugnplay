import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PlugNPlay – Visual Workflow Automation",
  description:
    "PlugNPlay is a powerful visual workflow builder that lets you automate tasks, connect APIs, and integrate services — no code required.",
  keywords: [
    "PlugNPlay",
    "workflow automation",
    "n8n alternative",
    "no-code automation",
    "API integration",
    "task automation",
    "webhooks",
    "Zapier alternative",
    "workflow builder",
  ],
  authors: [{ name: "PlugNPlay Team" }],
  openGraph: {
    title: "PlugNPlay – Visual Workflow Automation",
    description:
      "Build powerful workflows visually and connect your tools effortlessly. No-code automation made simple.",
    url: "https://your-domain.com",
    siteName: "PlugNPlay",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PlugNPlay – Visual Workflow Automation",
    description:
      "Automate your tasks, connect APIs, and build workflows — all visually and without code using PlugNPlay.",
    creator: "@yourhandle", // optional
  },
  metadataBase: new URL("https://your-domain.com"), // update with actual domain
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        cssLayerName: "clerk",
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            async
            src={"https://analytics.plugnplay.cc/tracker.js"}
            data-ackee-server="https://analytics.plugnplay.cc"
            data-ackee-domain-id="24964168-052c-465e-9ff8-38978c16cb90"
            data-ackee-opts='{ "detailed": true }'
          ></script>
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {/* <div id="dialog-portal" className="absolute z-[9999]"></div> */}

          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
