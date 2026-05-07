import type { Metadata } from "next";
import Script from "next/script";
import {
  Comfortaa,
  Geist_Mono,
  Hammersmith_One,
  Inter,
  Sometype_Mono,
  Titan_One,
  Lato,
} from "next/font/google";
import "./globals.css";
import { comixLoud } from "./spinner/utils/font";
import AppChrome from "./AppChrome";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: "300",
});

const someType = Sometype_Mono({
  variable: "--font-sometype-mono",
  subsets: ["latin"],
  weight: "400",
});

const titan = Titan_One({
  variable: "--font-titan-one",
  subsets: ["latin"],
  weight: "400",
});

const hammer = Hammersmith_One({
  variable: "--font-hammersmith-one",
  subsets: ["latin"],
  weight: "400",
});

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
  weight: "400",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fontVariables = [
  inter.variable,
  lato.variable,
  comixLoud.variable,
  someType.variable,
  titan.variable,
  hammer.variable,
  comfortaa.variable,
  geistMono.variable,
].join(" ");

export const metadata: Metadata = {
  title: "Voltis Labs",
  description: "Software Development Company",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontVariables} min-h-screen antialiased`}
        style={{
          backgroundColor: "#f4efe6",
          color: "#14100d",
        }}
      >
        {process.env.NODE_ENV === "production" && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-HJR9KYF4KR"
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-HJR9KYF4KR');
              `}
            </Script>
          </>
        )}
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
