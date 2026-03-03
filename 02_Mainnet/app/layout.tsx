import { PiAuthProvider } from "./contexts/pi-auth-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* MESH FORCE: Direct script injection to bypass Next.js export mines */}
        <script src="https://sdk.minepi.com/pi-sdk.js" defer></script>
      </head>
      <body style={{ backgroundColor: 'black', margin: 0, color: '#06b6d4' }}>
        <PiAuthProvider>
          {children}
        </PiAuthProvider>
      </body>
    </html>
  );
}