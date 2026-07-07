import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

// Sans moderne et propre (proche de SF Pro / esprit Apple) pour toute l'interface.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LoiHub — le GitHub de la loi",
    template: "%s · LoiHub",
  },
  description:
    "Suivez l'évolution des lois comme un dépôt de code : versions, diffs, amendements et contributeurs, à partir des données officielles de l'Assemblée nationale.",
  applicationName: "LoiHub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
