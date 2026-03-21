import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans, Nunito, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeColorMeta } from "@/components/theme-color-meta";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { PostHogProvider, PostHogPageView } from "@posthog/next";

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

export const metadata: Metadata = {
  title: "Vitaflix",
  description: "Vitaflix - Your nutrition, finally simple",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  const posthogHost = "https://us.i.posthog.com";
  const isPostHogEnabled =
    Boolean(posthogKey) &&
    (process.env.NEXT_PUBLIC_ENVIRONMENT ?? process.env.ENVIRONMENT) === "production";

  const appContent = (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ThemeColorMeta />
        <NuqsAdapter>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </NuqsAdapter>
      </ThemeProvider>
    </NextIntlClientProvider>
  );

  return (
    <html lang={locale} suppressHydrationWarning className={`scroll-smooth ${plusJakartaSans.variable} ${nunito.variable} ${poppins.variable}`}>
      <body
        className={`${geistMono.variable} relative font-sans bg-[#FAFCFF] text-slate-900 antialiased selection:bg-primary/20 selection:text-primary`}
      >
        {isPostHogEnabled ? (
          <PostHogProvider
            apiKey={posthogKey}
            clientOptions={{
              api_host: posthogHost,
              defaults: "2026-01-30",
              person_profiles: "always",
              capture_pageview: false,
              capture_pageleave: true,
            }}
          >
            <PostHogPageView />
            {appContent}
          </PostHogProvider>
        ) : (
          appContent
        )}
      </body>
    </html>
  );
}
