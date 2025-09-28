import "./globals.css";
import SessionWrapper from "./component/SessionWrapper";
import { SUSE} from "next/font/google";

export const metadata = {
  title: "CertifyPro",
  description: "Automated certification service",
};

const suse = SUSE({
  subsets: ["latin"],
  weight: ["400"]
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={suse.className}>
      <SessionWrapper>
      <body>{children}</body>
      </SessionWrapper>
    </html>
  );
}