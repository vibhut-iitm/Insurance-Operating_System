import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Insurance-Operating_System | Sample Website",
  description: "A sample insurance website for the Insurance-Operating_System project. Demo information only.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
