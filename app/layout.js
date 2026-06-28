import './globals.css';

export const metadata = {
  title: 'Heart Meets Hardware — AZFC 2026',
  description: 'Arizona Fire Chiefs Conference 2026 — Presented by Ashley Losch, PublicSafetyIQ',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-hmh-black text-hmh-cream min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
