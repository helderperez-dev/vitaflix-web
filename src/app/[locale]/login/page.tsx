import { LoginForm } from "@/components/auth/login-form"
import Image from "next/image"
import { LoginThemeToggle } from "@/components/auth/login-theme-toggle"
import { LanguageSwitcher } from "@/components/landing/language-switcher"
import { getTranslations } from "next-intl/server"

export default async function LoginPage() {
  const t = await getTranslations("Auth")

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden p-6 md:p-8 bg-gradient-to-br from-zinc-100 via-white to-zinc-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Decorative Gradient Blobs for extra minimalism */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 dark:bg-primary/5 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px]" />
      </div>

      {/* Floating Form Card */}
      <div className="relative z-10 w-full max-w-[440px] p-8 sm:p-10 lg:p-12 space-y-10 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl dark:shadow-2xl rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-8 duration-1000 transition-colors duration-500">

        {/* Logo row + Actions */}
        <div className="flex items-center justify-between">
          <div className="relative w-14 h-14">
            <Image
              src="/vitaflix_logo_dark_mode.png"
              alt="Vitaflix Logo"
              fill
              priority
              className="object-contain drop-shadow-sm hidden dark:block"
            />
            <Image
              src="/vitaflix_logo_light_mode.png"
              alt="Vitaflix Logo"
              fill
              priority
              className="object-contain drop-shadow-sm block dark:hidden"
            />
          </div>
          <div className="flex items-center gap-1 text-foreground/50">
            <LanguageSwitcher />
            <LoginThemeToggle />
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-2 text-left">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("welcome")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("description")}
            </p>
          </div>
          <LoginForm />
        </div>

      </div>

    </div>
  )
}
