import "./globals.css";

export const metadata = {
  title: "Premium Appointments",
  description: "Book your appointment quickly and effortlessly.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
