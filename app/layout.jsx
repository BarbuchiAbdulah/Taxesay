import "./globals.css";

export const metadata = {
  title: "TaxEase",
  description: "Free tax guidance for international students",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
