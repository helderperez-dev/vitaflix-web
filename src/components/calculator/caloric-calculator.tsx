"use client"

import * as React from "react"
import { useState, useMemo, useEffect } from "react"
import { OptionCard } from "./option-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { 
    Info, 
    Loader2, 
    Mail, 
    User, 
    Activity, 
    Footprints, 
    Target, 
    Flame, 
    ChefHat,
    Coffee,
    PersonStanding,
    Dumbbell,
    Zap,
    Trophy,
    Timer,
    Move,
    Medal,
    ArrowRight,
    Sparkles,
    Leaf,
    Scale,
    TrendingDown,
    Zap as FastIcon
} from "lucide-react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import { syncCalculatorLeadAction } from "@/app/actions/calculator"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

function AnimatedNumber({ value }: { value: number }) {
    const motionValue = useMotionValue(0)
    const springValue = useSpring(motionValue, {
        stiffness: 40,
        damping: 15,
        restDelta: 0.001
    })
    const displayValue = useTransform(springValue, (v) => Math.round(v).toLocaleString())

    useEffect(() => {
        motionValue.set(value)
    }, [value, motionValue])

    return <motion.span>{displayValue}</motion.span>
}

const ACTIVITY_LEVELS = [
    { id: "sedentary", multiplier: 1.2, icon: Coffee },
    { id: "lightly", multiplier: 1.375, icon: PersonStanding },
    { id: "moderately", multiplier: 1.55, icon: Activity },
    { id: "very", multiplier: 1.725, icon: Dumbbell },
    { id: "extra", multiplier: 1.9, icon: Zap },
]

const STEP_OPTIONS = [
    { id: "low", value: 2500, icon: Footprints },
    { id: "moderate", value: 6500, icon: Move },
    { id: "active", value: 10000, icon: Timer },
    { id: "high", value: 13500, icon: Trophy },
    { id: "athlete", value: 17500, icon: Medal },
]

const GOALS = [
    { id: "lose_sustainable", offset: -250, icon: Leaf },
    { id: "lose_balanced", offset: -500, icon: Scale },
    { id: "lose_faster", offset: -750, icon: TrendingDown },
    { id: "maintenance", offset: 0, icon: Activity },
    { id: "gain_mass", offset: 300, icon: Dumbbell },
]

function SectionHeader({ number, title, tooltip }: { number: string, title: string, tooltip?: string }) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-black tracking-[0.2em] text-primary/60">{number}</span>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">{title}</h3>
            </div>
            {tooltip && (
                <TooltipProvider delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 cursor-help text-muted-foreground/30 transition-colors hover:text-primary" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px] bg-secondary text-secondary-foreground text-[11px] font-medium p-3 border-none shadow-xl">
                            {tooltip}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    )
}

export function CaloricCalculator() {
    const t = useTranslations("Calculator")
    
    // Form State
    const [gender, setGender] = useState<"male" | "female">("male")
    const [weight, setWeight] = useState<string>("70")
    const [height, setHeight] = useState<string>("175")
    const [age, setAge] = useState<string>("25")
    const [activityLevel, setActivityLevel] = useState(ACTIVITY_LEVELS[0].id)
    const [steps, setSteps] = useState(STEP_OPTIONS[1].id)
    const [goal, setGoal] = useState(GOALS[3].id)

    // Lead Capture State
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    // Calculation Logic
    const results = useMemo(() => {
        const w = parseFloat(weight) || 0
        const h = parseFloat(height) || 0
        const a = parseFloat(age) || 0
        
        if (w === 0 || h === 0 || a === 0) return null

        // 1. BMR (Mifflin-St Jeor)
        let bmr = (10 * w) + (6.25 * h) - (5 * a)
        bmr = gender === "male" ? bmr + 5 : bmr - 161

        // 2. Activity Multiplier (TDEE baseline)
        const activityMultiplier = ACTIVITY_LEVELS.find(l => l.id === activityLevel)?.multiplier || 1.2
        const baseTdee = bmr * activityMultiplier

        // 3. Step Adjustment
        const stepValue = STEP_OPTIONS.find(s => s.id === steps)?.value || 0
        const stepAdjustment = 0.0004 * w * stepValue

        // 4. Goal Offset
        const goalOffset = GOALS.find(g => g.id === goal)?.offset || 0

        const finalTdee = baseTdee + stepAdjustment + goalOffset
        
        // Weight change estimate (approx 7700 kcal = 1kg)
        const weeklyDeficit = goalOffset * 7
        const weeklyWeightChange = weeklyDeficit / 7700
        const monthlyWeightChange = (weeklyDeficit * 4) / 7700

        return {
            bmr: Math.round(bmr),
            tdee: Math.round(baseTdee + stepAdjustment),
            target: Math.round(finalTdee),
            weeklyChange: Math.abs(weeklyWeightChange).toFixed(3),
            monthlyChange: Math.abs(monthlyWeightChange).toFixed(3),
            isLoss: goalOffset < 0,
            isGain: goalOffset > 0,
        }
    }, [gender, weight, height, age, activityLevel, steps, goal])

    const handleSync = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !email) {
            return
        }

        setIsSubmitting(true)
        try {
            const result = await syncCalculatorLeadAction(name, email)
            if (result.success) {
                setIsSubmitted(true)
            } else {
                toast.error(result.error || "Error")
            }
        } catch (error) {
            toast.error("Error")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="mx-auto max-w-4xl space-y-12 px-4 pb-20 md:px-0">
            {/* Main Form Section */}
            <div className="grid gap-12 lg:grid-cols-2">
                {/* Physical Data */}
                <div className="space-y-8">
                    <SectionHeader number="01" title={t("Sections.personal")} />

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                type="button"
                                className={cn(
                                    "h-12 rounded-xl text-base font-semibold transition-all",
                                    gender === "male" 
                                        ? "bg-primary border-2 border-primary text-white shadow-xl shadow-primary/20" 
                                        : "bg-white border border-slate-200 text-slate-600 hover:border-primary/30"
                                )}
                                onClick={() => setGender("male")}
                            >
                                {t("Inputs.male")}
                            </button>
                            <button 
                                type="button"
                                className={cn(
                                    "h-12 rounded-xl text-base font-semibold transition-all",
                                    gender === "female" 
                                        ? "bg-primary border-2 border-primary text-white shadow-xl shadow-primary/20" 
                                        : "bg-white border border-slate-200 text-slate-600 hover:border-primary/30"
                                )}
                                onClick={() => setGender("female")}
                            >
                                {t("Inputs.female")}
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-secondary/50">{t("Inputs.weight")}</Label>
                                <Input 
                                    type="number" 
                                    value={weight} 
                                    onChange={(e) => setWeight(e.target.value)}
                                    className="h-11 border border-slate-200 bg-white text-secondary font-semibold focus:border-primary focus:ring-0 transition-all shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-secondary/50">{t("Inputs.height")}</Label>
                                <Input 
                                    type="number" 
                                    value={height} 
                                    onChange={(e) => setHeight(e.target.value)}
                                    className="h-11 border border-slate-200 bg-white text-secondary font-semibold focus:border-primary focus:ring-0 transition-all shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-secondary/50">{t("Inputs.age")}</Label>
                                <Input 
                                    type="number" 
                                    value={age} 
                                    onChange={(e) => setAge(e.target.value)}
                                    className="h-11 border border-slate-200 bg-white text-secondary font-semibold focus:border-primary focus:ring-0 transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <Separator className="opacity-50" />

                    {/* Activity Level */}
                    <div className="space-y-4">
                        <SectionHeader 
                            number="02" 
                            title={t("Sections.activity")} 
                            tooltip={t("Sections.activityTooltip")}
                        />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {ACTIVITY_LEVELS.map((level) => (
                                <OptionCard
                                    key={level.id}
                                    icon={<level.icon className="h-6 w-6" />}
                                    title={t(`ActivityLevels.${level.id}.title`)}
                                    description={t(`ActivityLevels.${level.id}.desc`)}
                                    isSelected={activityLevel === level.id}
                                    onClick={() => setActivityLevel(level.id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Steps & Goal */}
                <div className="space-y-8">
                    {/* Steps */}
                    <div className="space-y-4">
                        <SectionHeader number="03" title={t("Sections.steps")} />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {STEP_OPTIONS.map((option) => (
                                <OptionCard
                                    key={option.id}
                                    icon={<option.icon className="h-6 w-6" />}
                                    title={t(`StepOptions.${option.id}.title`)}
                                    description={t(`StepOptions.${option.id}.desc`)}
                                    isSelected={steps === option.id}
                                    onClick={() => setSteps(option.id)}
                                />
                            ))}
                        </div>
                    </div>

                    <Separator className="opacity-50" />

                    {/* Goal */}
                    <div className="space-y-4">
                        <SectionHeader number="04" title={t("Sections.goal")} />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {GOALS.map((g) => (
                                <OptionCard
                                    key={g.id}
                                    icon={<g.icon className="h-6 w-6" />}
                                    title={t(`Goals.${g.id}.title`)}
                                    description={t(`Goals.${g.id}.desc`)}
                                    isSelected={goal === g.id}
                                    onClick={() => setGoal(g.id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Final Step: Lead Capture */}
            {!isSubmitted && (
                <div className="mx-auto max-w-lg space-y-8 text-center pt-8">
                    <Separator className="opacity-50" />
                    <div className="space-y-3">
                        <h3 className="text-2xl font-black text-secondary">{t("Form.title")}</h3>
                        <p className="text-muted-foreground">{t("Form.description")}</p>
                    </div>
                    <Card className="overflow-hidden border-none shadow-2xl">
                        <CardContent className="p-0">
                            <form onSubmit={handleSync} className="flex flex-col">
                                <div className="space-y-4 p-8 text-left">
                                    <div className="space-y-1.5">
                                        <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("Form.name")}</Label>
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                placeholder="John Doe" 
                                                className="h-12 pl-11 bg-muted/5 font-medium transition-all focus:bg-background"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("Form.email")}</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                type="email" 
                                                placeholder="john@example.com" 
                                                className="h-12 pl-11 bg-muted/5 font-medium transition-all focus:bg-background"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Button type="submit" className="h-16 rounded-none text-lg font-bold transition-all hover:scale-[1.01] active:scale-95" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : t("Form.button")}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Results Section */}
            <AnimatePresence mode="wait">
                {isSubmitted && results && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -30 }}
                        className="rounded-[2.5rem] bg-primary/10 p-8 md:p-16"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-2xl shadow-primary/30">
                                <Flame className="h-10 w-10" />
                            </div>
                            
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-2"
                            >
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary/80">{t("Form.success")}</p>
                                <h3 className="text-3xl font-black text-secondary md:text-4xl">{t("Results.title")}</h3>
                            </motion.div>

                            <div className="mt-8 flex flex-col items-center gap-1">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-primary text-4xl font-bold md:text-5xl">~</span>
                                    <span className="text-7xl font-black text-primary md:text-8xl tracking-tight">
                                        <AnimatedNumber value={results.target} />
                                    </span>
                                </div>
                                <span className="text-xl font-bold text-muted-foreground uppercase tracking-widest">{t("Results.unit")}</span>
                                
                                {(results.isLoss || results.isGain) && (
                                    <div className="mt-6 flex md:hidden flex-wrap justify-center gap-3">
                                        <div className="flex flex-col items-center rounded-2xl bg-primary/5 px-6 py-3 border border-primary/10">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">{t("Results.weekly")}</span>
                                            <span className="text-xl font-black text-primary">
                                                {results.isLoss ? "-" : "+"}{parseFloat(results.weeklyChange).toFixed(3)} <span className="text-xs">kg</span>
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-center rounded-2xl bg-primary/5 px-6 py-3 border border-primary/10">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">{t("Results.monthly")}</span>
                                            <span className="text-xl font-black text-primary">
                                                {results.isLoss ? "-" : "+"}{parseFloat(results.monthlyChange).toFixed(3)} <span className="text-xs">kg</span>
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <p className="hidden md:block mt-10 max-w-xl text-lg font-medium leading-relaxed text-secondary/70 md:text-xl">
                                {results.isLoss ? (
                                    <>{t.rich("Results.loss", { 
                                        weekly: results.weeklyChange, 
                                        monthly: results.monthlyChange,
                                        bold: (chunks) => <strong className="text-secondary font-bold">{chunks}</strong>
                                    })}</>
                                ) : results.isGain ? (
                                    <>{t.rich("Results.gain", { 
                                        weekly: results.weeklyChange, 
                                        monthly: results.monthlyChange,
                                        bold: (chunks) => <strong className="text-secondary font-bold">{chunks}</strong>
                                    })}</>
                                ) : (
                                    <>{t("Results.maintenance")}</>
                                )}
                            </p>

                            {/* VitaFlix Premium CTA Card */}
                             <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="mt-16 w-full max-w-2xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-primary to-[#0e8263] p-1 shadow-2xl"
                            >
                                <div className="relative h-full w-full rounded-[1.8rem] bg-background/5 px-4 py-10 backdrop-blur-xl md:p-10">
                                    <div className="flex flex-col items-center gap-6 text-center md:flex-row md:gap-8 md:text-left">
                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white shadow-inner backdrop-blur-md">
                                            <ChefHat className="h-8 w-8" />
                                        </div>
                                        <div className="space-y-6 w-full">
                                            <h4 className="mx-auto max-w-[260px] text-sm font-semibold text-white md:max-w-none md:text-2xl leading-relaxed tracking-tight break-words">
                                                {t("CTA.text")}{" "}
                                                <a 
                                                    href="https://vitaflix.app" 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 font-black text-white decoration-white/30 underline-offset-4 hover:underline transition-all active:scale-95"
                                                >
                                                    <Sparkles className="h-5 w-5 animate-pulse" />
                                                    {t("CTA.brand")}
                                                </a>
                                            </h4>
                                            <Button 
                                                asChild 
                                                size="lg" 
                                                className="group mx-auto h-14 w-full max-w-[240px] bg-white px-8 text-[15px] font-bold text-primary shadow-xl hover:bg-white/90 active:scale-95 md:max-w-auto md:w-auto"
                                            >
                                                <a 
                                                    href="https://vitaflix.app" 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                >
                                                    {t("CTA.button")}
                                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                    {/* Decorative circles */}
                                    <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/5" />
                                    <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/5" />
                                </div>
                            </motion.div>

                            <Button 
                                variant="ghost" 
                                className="mt-12 font-bold text-muted-foreground transition-colors hover:text-primary"
                                onClick={() => {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            >
                                Recalculate
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <footer className="pt-12 pb-8 text-center">
                <p className="mx-auto max-w-2xl text-[10px] uppercase tracking-widest text-muted-foreground/40 leading-relaxed">
                    {t("Footer.disclaimer")}
                </p>
            </footer>
        </div>
    )
}
