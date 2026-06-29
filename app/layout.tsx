import './globals.css';
import type { ReactNode } from 'react';
import { Elms_Sans } from 'next/font/google';

const elmsSans = Elms_Sans({
  subsets: ['vietnamese', 'latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-elms-sans',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className={`${elmsSans.variable}`}>
      <body className="font-sans antialiased text-[#2F2F2F] bg-[#FAFAFA]">
        {children}
      </body>
    </html>
  );
}
