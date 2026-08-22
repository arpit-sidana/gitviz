import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GitViz — Understand a repository',
  description: 'An evidence-backed map of unfamiliar public repositories. GitViz is a work in progress.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
