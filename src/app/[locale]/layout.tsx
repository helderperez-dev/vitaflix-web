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
import { MetaPixel } from "@/components/tracking/meta-pixel";
import { getSystemConfig } from "@/app/actions/settings";

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

export async function generateMetadata(): Promise<Metadata> {
  const platformName = await getSystemConfig('platform_name', 'Vitaflix')
  const faviconUrl = await getSystemConfig('favicon_url', '/favicon.png')
  
  return {
    title: platformName,
    description: "Vitaflix - Your nutrition, finally simple",
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
    verification: {
      other: {
        "facebook-domain-verification": ["qm1fgzdqa4xk9nom1bm4lyqrpoupb7"],
      },
    },
  };
}

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
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
  const runtimeEnvironment = (
    process.env.VERCEL_ENV ??
    process.env.NODE_ENV ??
    process.env.NEXT_PUBLIC_ENVIRONMENT ??
    process.env.ENVIRONMENT ??
    ""
  ).toLowerCase();
  const isPostHogEnabled =
    Boolean(posthogKey) &&
    (runtimeEnvironment === "production" || runtimeEnvironment === "prod");

  const appContent = (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ThemeColorMeta />
        <MetaPixel />
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
            apiKey={posthogKey!}
            clientOptions={{
              api_host: posthogHost,
              ui_host: "https://us.posthog.com",
              defaults: "2026-01-30",
              capture_pageview: false, // Handled by PostHogPageView
              capture_pageleave: true,
              person_profiles: "identified_only",
              disable_session_recording: false,
              session_recording: {
                maskAllInputs: false,
                maskTextSelector: undefined,
              },
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
