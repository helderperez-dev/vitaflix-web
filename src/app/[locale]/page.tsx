import { LoginForm } from "@/components/auth/login-form"
import Image from "next/image"
import { VideoBackground } from "@/components/auth/video-background"
import { LoginThemeToggle } from "@/components/auth/login-theme-toggle"
import { getTranslations } from "next-intl/server"

export default async function LoginPage() {
  const t = await getTranslations("Auth")

  return (
    <div className="relative min-h-screen w-full flex flex-col md:flex-row items-center justify-center overflow-hidden p-6 md:p-8">
      {/* Video Background spanning entire screen */}
      <div className="absolute inset-0 z-0">
        <VideoBackground />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/45 dark:bg-black/65" />
      </div>

      {/* Glassmorphism Floating Form Card */}
      <div className="relative z-10 w-full max-w-[440px] p-8 sm:p-10 lg:p-12 space-y-10 bg-white/10 dark:bg-black/70 backdrop-blur-2xl border border-white/20 dark:border-white/8 shadow-2xl dark:shadow-black/60 rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-8 duration-1000 transition-colors duration-500">

        {/* Logo row + Theme toggle */}
        <div className="flex items-center justify-between">
          <Image
            src="/vitaflix_logo_dark_mode.png"
            alt="Vitaflix Logo"
            width={56}
            height={56}
            priority
            className="object-contain drop-shadow-sm"
          />
          <LoginThemeToggle />
        </div>

        <div className="space-y-8">
          <div className="space-y-2 text-left">
            <h1 className="text-3xl font-bold tracking-tight text-white">{t("welcome")}</h1>
            <p className="text-white/60 text-sm">
              {t("description")}
            </p>
          </div>
          <LoginForm />
        </div>

      </div>

    </div>
  )
}
