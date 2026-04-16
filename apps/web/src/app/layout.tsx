import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Provider from "./_components/Provider";
import ForceLightMode from "./_components/ForceLightMode";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "OTBL Site Dashboard",
  description: "OTBL  Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ForceLightMode />
        <Provider>
          <main className='w-full'>
            {children}

            {/* <iframe
              src='http://localhost:8000'
              style={{
                position: "fixed",
                bottom: "0px",
                right: "0px",
                width: "450px",
                height: "700px",
                border: "none",
                background: "transparent",
                zIndex: "9999",
              }}
              allow='microphone'></iframe> */}
          </main>
        </Provider>
        <Toaster />
      </body>
    </html>
  );
}
