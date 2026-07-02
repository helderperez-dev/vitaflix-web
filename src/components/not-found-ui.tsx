import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export function NotFoundUI() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden p-6 md:p-8 bg-gradient-to-br from-zinc-100 via-white to-zinc-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Decorative Gradient Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 dark:bg-primary/5 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px]" />
      </div>

      {/* Floating Card */}
      <div className="relative z-10 w-full max-w-[440px] p-8 sm:p-10 lg:p-12 flex flex-col items-center text-center space-y-8 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl dark:shadow-2xl rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-8 duration-1000 transition-colors">
        
        {/* Logo */}
        <div className="relative w-16 h-16">
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

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">404</h1>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Página não encontrada</h2>
          <p className="text-foreground/70 text-sm">
            A página que procuras não existe ou foi movida para outro endereço.
          </p>
        </div>

        <Button asChild className="w-full rounded-full h-12 text-base font-medium transition-transform active:scale-[0.98]">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Link>
        </Button>
      </div>
    </div>
  )
}
