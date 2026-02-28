"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Loader2
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { mealSchema, type Meal } from "@/shared-schemas/meal"
import { upsertMeal } from "@/app/actions/meals"
import { TranslationFields } from "@/components/shared/translation-fields"

interface MealDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    meal?: Meal | null
}

export function MealDrawer({ open, onOpenChange, meal }: MealDrawerProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const form = useForm({
        resolver: zodResolver(mealSchema),
        defaultValues: {
            name: {},
            mealTypes: [],
            cookTime: 0,
            preparationMode: {},
            satiety: 5,
            restrictions: [],
            publishOn: null,
        },
    }) as any

    React.useEffect(() => {
        if (meal) {
            form.reset({
                ...meal,
                name: meal.name || {},
                preparationMode: meal.preparationMode || {}
            })
        } else {
            form.reset({
                name: {},
                mealTypes: [],
                cookTime: 0,
                preparationMode: {},
                satiety: 5,
                restrictions: [],
                publishOn: null,
            })
        }
    }, [meal, form])

    async function onSubmit(values: Meal) {
        setIsSubmitting(true)
        try {
            const result = await upsertMeal(values)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success(meal ? "Recipe updated successfully" : "Recipe created successfully")
                onOpenChange(false)
            }
        } catch (error) {
            toast.error("Failed to save meal")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-2xl p-0 flex flex-col bg-background border-l border-border">
                {/* Minimalist Top Accent */}
                <div className="h-1 w-full bg-primary" />

                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <SheetHeader className="px-8 py-8 space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border-transparent">
                                {meal ? "Culinary Management" : "Recipe Authoring"}
                            </Badge>
                            {meal && (
                                <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-mono border-border text-muted-foreground bg-muted/30">
                                    REF: {meal.id?.split("-")[0]}
                                </Badge>
                            )}
                        </div>
                        <SheetTitle className="text-2xl font-bold tracking-tight text-secondary">
                            {meal ? "Edit Recipe" : "New Recipe"}
                        </SheetTitle>
                        <SheetDescription className="text-sm">
                            {meal
                                ? "Update culinary instructions, titles, and categorization for this recipe."
                                : "Create a world-class culinary recipe with detailed preparation steps."}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar">
                        <Form {...form}>
                            <form id="meal-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                                {/* Recipe Name */}
                                <TranslationFields
                                    form={form}
                                    namePrefix="name"
                                    label="Recipe Name"
                                    placeholder="e.g. Classic Burgers"
                                />

                                {/* Culinary Metrics */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-sm text-secondary uppercase tracking-widest">Culinary Metrics</h3>
                                        <div className="h-px flex-1 bg-border/60 ml-2" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                                        <FormField
                                            control={form.control}
                                            name="cookTime"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Prep Time</FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <Input type="number" className="pr-16 font-semibold" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/40 transition-colors group-hover:text-primary">MIN</span>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="satiety"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Satiety Index</FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <Input type="number" className="pr-16 font-semibold" min={0} max={10} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/40 transition-colors group-hover:text-primary">/ 10</span>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Categorization */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-sm text-secondary uppercase tracking-widest">Categorization</h3>
                                        <div className="h-px flex-1 bg-border/60 ml-2" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                        <FormField
                                            control={form.control}
                                            name="mealTypes"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Meal Categories</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Lunch, Dinner..."
                                                            value={field.value?.join(", ") || ""}
                                                            onChange={(e) => field.onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="restrictions"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Dietary Tags</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Vegan, Low-carb..."
                                                            value={field.value?.join(", ") || ""}
                                                            onChange={(e) => field.onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Preparation Mode */}
                                <TranslationFields
                                    form={form}
                                    namePrefix="preparationMode"
                                    label="Preparation Mode"
                                    type="textarea"
                                    placeholder="Describe the culinary process..."
                                />
                            </form>
                        </Form>
                    </div>

                    <SheetFooter className="px-8 py-8 border-t flex flex-row items-center justify-end gap-3 bg-muted/5">
                        <Button
                            variant="outline"
                            className="h-10 px-6 font-bold text-xs uppercase tracking-widest border-border hover:bg-muted/30 transition-colors"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="meal-form"
                            className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest shadow-sm shadow-primary/10 transition-all active:scale-[0.98]"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Save
                        </Button>
                    </SheetFooter>
                </div>
            </SheetContent>
        </Sheet>
    )
}
