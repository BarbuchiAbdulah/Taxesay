import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata = {
  title: "TaxEase",
  description: "Free tax guidance for international students",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
