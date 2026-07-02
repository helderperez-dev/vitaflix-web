import { Geist_Mono, Plus_Jakarta_Sans, Nunito, Poppins } from "next/font/google";
import "./[locale]/globals.css";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { NotFoundUI } from "@/components/not-found-ui";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: '--font-plus-jakarta',
});

const nunito = Nunito({ 
  subsets: ["latin"],
  variable: '--font-nunito',
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: '--font-poppins',
});

export default function GlobalNotFound() {
  return (
    <html lang="pt" suppressHydrationWarning className={`scroll-smooth ${plusJakartaSans.variable} ${nunito.variable} ${poppins.variable}`}>
      <body className={`${geistMono.variable} relative font-sans bg-[#FAFCFF] text-slate-900 antialiased selection:bg-primary/20 selection:text-primary`}>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NotFoundUI />
        </NextThemesProvider>
      </body>
    </html>
  );
}
