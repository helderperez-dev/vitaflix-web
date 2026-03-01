import { LoginForm } from "@/components/auth/login-form"
import Image from "next/image"
import { ModeToggle } from "@/components/theme-toggle"
import { getTranslations } from "next-intl/server"

export default async function LoginPage() {
  const t = await getTranslations("Auth")

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2 overflow-hidden">
      {/* Theme Toggle - Fixed in top right */}
      <div className="absolute top-6 right-6 z-50">
        <ModeToggle />
      </div>

      <div className="flex flex-col min-h-screen bg-background relative selection:bg-primary/20">
        {/* Scrollable Container for the form to handle mobile properly */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 md:px-24 lg:px-32 xl:px-48 py-20 animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="mx-auto w-full max-w-sm space-y-12">
            {/* Minimalist Logo block */}
            <div className="flex items-center">
              <Image
                src="/vitaflix_logo_light_mode.png"
                alt="Vitaflix Logo"
                width={48}
                height={48}
                className="dark:hidden object-contain"
              />
              <Image
                src="/vitaflix_logo_dark_mode.png"
                alt="Vitaflix Logo"
                width={48}
                height={48}
                className="hidden dark:block object-contain"
              />
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{t("welcome")}</h1>
                <p className="text-muted-foreground text-sm">
                  {t("description")}
                </p>
              </div>
              <LoginForm />
            </div>
          </div>
        </div>

        <footer className="px-8 sm:px-16 md:px-24 lg:px-32 xl:px-48 py-8 text-xs text-muted-foreground/60 border-t lg:border-none">
          &copy; {new Date().getFullYear()} Vitaflix Wellness. All rights reserved.
        </footer>
      </div>

      <div className="hidden lg:block relative h-full w-full">
        <Image
          src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200"
          alt="Wellness Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 z-10 text-white animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <blockquote className="space-y-4">
            <p className="text-3xl font-medium leading-tight tracking-tight max-w-lg">
              &ldquo;{t("quote")}&rdquo;
            </p>
            <footer className="flex flex-col gap-1">
              <cite className="not-italic font-semibold text-primary">{t("quoteAuthor")}</cite>
              <span className="text-sm opacity-60">{t("quoteTitle")}</span>
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  )
}
