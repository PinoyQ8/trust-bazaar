import React from 'react';

export const metadata = {
  title: "Project Bazaar | Founder Command",
  description: "MESH Protocol v23 Mainnet Ready",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: 'black', margin: 0, color: '#06b6d4' }}>
        {children}
      </body>
    </html>
  );
}