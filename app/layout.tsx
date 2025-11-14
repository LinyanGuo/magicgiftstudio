import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Magic Gift Studio | Where every gift feels magical.",
  description: "Products made with love & a touch of magic. Local pickup only.",
  metadataBase: new URL("https://magicgiftstudio.com"),
  openGraph: {
    title: "Magic Gift Studio",
    description: "Where every gift feels magical.",
    url: "https://magicgiftstudio.com",
    siteName: "Magic Gift Studio",
    images: ["/products/logo.png"],
    locale: "en_CA",
    type: "website"
  },
  icons: { icon: "/products/logo.png" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <img className="site-header__cover" src="/products/cover.jpg" alt="Cover" />
          <div className="site-header__overlay" />
          <div className="site-header__content site-container">
            <img className="site-logo" src="/products/logo.png" alt="Logo" />
            <h1 className="site-title">Magic Gift Studio</h1>

            <nav className="site-nav" aria-label="Main navigation">
              <Link href="/" className="header-link">Home</Link>
            </nav>
          </div>
        </header>

        <main className="site-container">{children}</main>

        <footer style={{ padding: 16, textAlign: 'center', color: '#777', borderTop: '1px solid #f0f0f0' }}>
          © Magic Gift Studio
        </footer>
      </body>
    </html>
  );
}
