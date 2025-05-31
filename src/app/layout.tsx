import "~/styles/globals.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import ConvexClientProvider from "~/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { PostHogProvider } from "~/components/PostHogProvider";
import { dark } from "@clerk/themes";
import env from "#env";
import Footer from "~/components/footer";
import { VercelToolbar } from "@vercel/toolbar/next";
import { Toaster } from "~/components/ui/sonner";
import { ThemeProvider } from "~/components/theme-provider";
import Header from "~/components/header";

export const metadata: Metadata = {
  title: "Imkerportal Imkerei Ruder - by DJL",
  description: "desc",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  generator: "Next.js",
  applicationName: "Imkerportal-Ruder",
  referrer: "origin-when-cross-origin",
  keywords: [
    "imkerportal",
    "imkerei",
    "beekeeping",
    "bees",
    "honey",
    "Ruder",
    "DJL",
    "revolutionary",
    "secure",
    "intuitive",
  ],
  authors: [{ name: "Jack Ruder", url: "https://jack.djl.foundation" }],
  creator: "JackatDJL",
  publisher: "The DJL Foundation",
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  openGraph: {
    title: "Imkerportal Imkerei Ruder - by DJL",
    description: "desc",
    url: "https://ruder.portal.hackclub-stade.de",
    type: "website",
    locale: "de_DE",
    siteName: "Imkerportal Imkerei Ruder",
    images: [
      {
        url: "/opengraph.png", // in the SaaS Release this should be the generation endpoint
        width: 1200,
        height: 630,
        alt: "Imkerportal Imkerei Ruder - by DJL",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    site: "@JackatDJL",
    title: "Imkerportal Imkerei Ruder - by DJL",
    description: "desc",
    images: {
      url: "/opengraph.png",
      width: 1200,
      height: 630,
      alt: "Imkerportal Imkerei Ruder - by DJL",
    },
  },
  category: "Business",
  classification: "Beekeeping Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const shouldShowVercelToolbar = env.NODE_ENV === "development";

  return (
    <html lang="en">
      <body className={`${GeistSans.variable} antialiased`}>
        <ClerkProvider
          appearance={{
            baseTheme: dark,
          }}
          dynamic
        >
          <PostHogProvider>
            <ConvexClientProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <Toaster />
                <div className="flex min-h-screen flex-col bg-background text-foreground">
                  <Header />
                  <main className="flex-grow">{children}</main>
                  <Footer />
                </div>
              </ThemeProvider>
              {shouldShowVercelToolbar && <VercelToolbar />}
            </ConvexClientProvider>
          </PostHogProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
