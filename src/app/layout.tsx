
import type { Metadata } from "next";
import localFont from "next/font/local";
// @ts-expect-error -- Next.js supports side-effect global CSS imports in app layout
import "./globals.css";
import { cn } from "@/lib/utils";

import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "LoiHub",
  description: "LoiHub est une plateforme qui fournit un accès facile et rapide aux lois, amendements et informations sur les députés. Explorez les textes législatifs, suivez les modifications récentes et restez informé sur l'activité parlementaire.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}



// app/layout.tsx

// export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
//   return (
//     <div className="h-screen flex bg-[#0b0f17] text-gray-200">
      
//       <aside className="w-64 border-r border-gray-800 p-4">
//         <h1 className="text-xl font-bold mb-6">LoiHub</h1>

//         <nav className="space-y-3">
//           <a href="/laws">📜 Lois</a>
//           <a href="/amendments">✏️ Amendements</a>
//           <a href="/deputies">👤 Députés</a>
//           <a href="/graph">🕸 Graph</a>
//         </nav>
//       </aside>

//       <main className="flex-1 overflow-auto p-6">
//         {children}
//       </main>
//     </div>
//   );
// }