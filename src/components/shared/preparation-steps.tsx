"use client"

import * as React from "react"
import { Trash2, Plus, GripVertical, Pencil, MoreHorizontal, Sparkles, Loader2, Clock } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { useFieldArray } from "react-hook-form"
import { toast } from "sonner"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core"
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers"

import { Button } from "@/components/ui/button"
import { TranslationFields } from "@/components/shared/translation-fields"
import { cn } from "@/lib/utils"
import { generateMealPreparationStepsWithAI } from "@/app/actions/ai"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FormItem, FormLabel, FormControl } from "@/components/ui/form"

function TimeDurationInput({ value, onChange }: { value: number | null | undefined, onChange: (val: number | null) => void }) {
    const hasValue = typeof value === 'number' && value > 0;
    const minutes = hasValue ? Math.floor(value / 60) : "";
    const seconds = hasValue ? value % 60 : "";

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const m = val === "" ? 0 : parseInt(val) || 0;
        const s = hasValue ? value % 60 : 0;
        if (m === 0 && s === 0) onChange(null);
        else onChange(m * 60 + s);
    };

    const handleSecChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const s = val === "" ? 0 : parseInt(val) || 0;
        const m = hasValue ? Math.floor(value / 60) : 0;
        if (m === 0 && s === 0) onChange(null);
        else onChange(m * 60 + s);
    };

    return (
        <div className="flex items-center bg-white dark:bg-slate-900/80 border border-border/40 rounded-lg px-2.5 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all mr-2 group/time">
            <Clock className="h-3.5 w-3.5 text-muted-foreground/40 mr-2 group-focus-within/time:text-primary/60 transition-colors" />
            <input
                type="number"
                min="0"
                placeholder="00"
                value={minutes !== "" ? String(minutes).padStart(2, '0') : ""}
                onChange={handleMinChange}
                className="w-5 text-xs text-center bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-secondary dark:text-foreground font-semibold placeholder:text-muted-foreground/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-xs font-bold text-muted-foreground/40 mx-0.5">:</span>
            <input
                type="number"
                min="0"
                max="59"
                placeholder="00"
                value={seconds !== "" ? String(seconds).padStart(2, '0') : ""}
                onChange={handleSecChange}
                className="w-5 text-xs text-center bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-secondary dark:text-foreground font-semibold placeholder:text-muted-foreground/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
        </div>
    )
}

interface PreparationStepsProps {
    form: any
    namePrefix: string
    label: string
}

interface SortableStepItemProps {
    field: any
    index: number
    isEditing: boolean
    displayText: string
    durationSeconds?: number | null
    locale: string
    commonT: any
    t: any
    startEditing: (index: number) => void
    cancelEditing: () => void
    stopEditing: () => void
    remove: (index: number) => void
    form: any
    namePrefix: string
}

function SortableStepItem({
    field,
    index,
    isEditing,
    displayText,
    durationSeconds,
    locale,
    commonT,
    t,
    startEditing,
    cancelEditing,
    stopEditing,
    remove,
    form,
    namePrefix
}: SortableStepItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: field.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    }

    if (isEditing) {
        return (
            <div ref={setNodeRef} style={style} className="p-8 rounded-3xl border border-border/60 bg-muted/5 space-y-8 animate-in fade-in zoom-in-95 duration-300">
                <TranslationFields
                    form={form}
                    namePrefix={`${namePrefix}.${index}.text`}
                    label={`${t("step")} ${index + 1}`}
                    type="textarea"
                    placeholder={t("stepPlaceholder")}
                    isRichText={true}
                    headerActions={
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                                {t("stepDuration")}
                            </span>
                            <TimeDurationInput
                                value={form.watch(`${namePrefix}.${index}.duration_seconds`)}
                                onChange={(val) => form.setValue(`${namePrefix}.${index}.duration_seconds`, val, { shouldDirty: true })}
                            />
                        </div>
                    }
                />
                <div className="flex justify-end gap-3 pt-6 border-t border-border/40">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={cancelEditing}
                        className="h-10 px-6 font-semibold text-xs border-border hover:bg-muted/30 transition-colors"
                    >
                        {commonT("cancel")}
                    </Button>
                    <Button
                        type="button"
                        onClick={stopEditing}
                        className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-sm shadow-primary/5 transition-all active:scale-[0.98]"
                    >
                        {commonT("done")}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={() => startEditing(index)}
            className={cn(
                "group relative flex gap-6 p-6 pt-10 rounded-lg border border-border/30 bg-white dark:bg-slate-900/50 hover:border-border/60 hover:bg-muted/5 transition-all duration-300 cursor-pointer overflow-hidden",
                isDragging && "border-primary/20 bg-muted/10 opacity-60 scale-[1.02] rotate-[0.5deg]"
            )}
        >
            {/* Controls - Top Right */}
            <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    onClick={(e) => e.stopPropagation()}
                    className="cursor-grab active:cursor-grabbing p-2 text-muted-foreground/30 hover:text-secondary hover:bg-muted rounded-lg transition-colors"
                >
                    <GripVertical className="h-4 w-4" />
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground/40 hover:text-secondary hover:bg-muted rounded-lg transition-colors"
                        >
                            <MoreHorizontal className="h-4.5 w-4.5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32 bg-background/95 backdrop-blur-sm border-border/40 shadow-2xl rounded-lg">
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation()
                                startEditing(index)
                            }}
                            className="text-xs font-semibold py-2 cursor-pointer"
                        >
                            <Pencil className="mr-2 h-3.5 w-3.5 opacity-60" />
                            {commonT("edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={(e) => {
                                e.stopPropagation()
                                remove(index)
                            }}
                            className="text-xs font-semibold py-2 cursor-pointer"
                        >
                            <Trash2 className="mr-2 h-3.5 w-3.5 opacity-60" />
                            {commonT("delete")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/40 text-muted-foreground font-semibold text-xs mt-0.5">
                    {index + 1}
                </div>
                {durationSeconds && durationSeconds > 0 && (
                    <div className="px-2 py-1 rounded-md bg-muted/10 border border-border/40 text-muted-foreground text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                        <Clock className="h-3 w-3 opacity-50" />
                        <span>
                            {Math.floor(durationSeconds / 60)}:{String(durationSeconds % 60).padStart(2, '0')}
                        </span>
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col pt-0.5">
                <div
                    className={cn(
                        "text-sm font-medium text-secondary dark:text-foreground/90 leading-relaxed max-w-none",
                        "[&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_ul]:my-2 [&_ol]:my-2",
                        "[&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-primary [&_h3]:mt-2",
                        "[&_blockquote]:border-l-2 [&_blockquote]:border-primary/20 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-2 [&_blockquote]:text-muted-foreground",
                        "[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-2 [&_img]:border [&_img]:border-border/20"
                    )}
                    dangerouslySetInnerHTML={{ __html: displayText as string }}
                />
            </div>
        </div>
    )
}

export function PreparationSteps({ form, namePrefix, label }: PreparationStepsProps) {
    const t = useTranslations("Meals")
    const commonT = useTranslations("Common")
    const locale = useLocale()
    const { fields, append, remove, update, move } = useFieldArray({
        control: form.control,
        name: namePrefix
    })

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Avoid accidental drags when clicking
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const [isAdding, setIsAdding] = React.useState(false)
    const [editingIndex, setEditingIndex] = React.useState<number | null>(null)
    const [originalStepValues, setOriginalStepValues] = React.useState<any>(null)
    const [isGeneratingWithAI, setIsGeneratingWithAI] = React.useState(false)

    // Temporary watch for the new step being added
    const newStepValues = form.watch("newPrepStep") || {}
    const hasNewStepData = Object.values(newStepValues.text || {}).some((val: any) =>
        typeof val === 'string' && val.replace(/<[^>]*>/g, '').trim().length > 0
    )

    const handleAddStep = () => {
        if (hasNewStepData) {
            append(newStepValues)
            form.setValue("newPrepStep", { text: {}, duration_seconds: 0 })
            setIsAdding(false)
        }
    }

    const cancelAdding = () => {
        form.setValue("newPrepStep", { text: {}, duration_seconds: 0 })
        setIsAdding(false)
    }

    const startEditing = (index: number) => {
        const stepData = form.getValues(`${namePrefix}.${index}`)
        // Ensure data is normalized before editing
        if (stepData && !stepData.text) {
            const normalized = { text: stepData, duration_seconds: null }
            update(index, normalized)
            setOriginalStepValues(normalized)
        } else {
            setOriginalStepValues(stepData)
        }
        setEditingIndex(index)
        setIsAdding(false)
    }

    const stopEditing = () => {
        setEditingIndex(null)
        setOriginalStepValues(null)
    }

    const cancelEditing = () => {
        if (editingIndex !== null && originalStepValues) {
            update(editingIndex, originalStepValues)
        }
        setEditingIndex(null)
        setOriginalStepValues(null)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = fields.findIndex((f: any) => f.id === active.id)
            const newIndex = fields.findIndex((f: any) => f.id === over.id)
            move(oldIndex, newIndex)
        }
    }

    const handleGenerateAllSteps = async () => {
        const mealNameTranslations = form.getValues("name") || {}
        const mealName =
            mealNameTranslations[locale] ||
            mealNameTranslations["en"] ||
            Object.values(mealNameTranslations)[0] ||
            "Meal"

        const options = form.getValues("options") || []
        const defaultOption = options.find((option: any) => option?.isDefault) || options[0]
        const ingredients = (defaultOption?.ingredients || []).map((ingredient: any) => ({
            productId: ingredient.productId,
            quantity: Number(ingredient.quantity) || 0,
            unit: ingredient.unit || "",
        })).filter((ingredient: any) => ingredient.productId && ingredient.quantity > 0)

        if (ingredients.length === 0) {
            toast.error(t("noPrepSteps"))
            return
        }

        const existingStepTexts = (form.getValues(namePrefix) || [])
            .map((step: any) => {
                const text = step?.text || step;
                return text?.[locale] || text?.en || Object.values(text || {})[0];
            })
            .filter((step: any) => typeof step === "string" && step.trim().length > 0)

        setIsGeneratingWithAI(true)
        const result = await generateMealPreparationStepsWithAI({
            targetLanguage: locale,
            mealName: String(mealName),
            ingredients,
            existingPreparationModes: existingStepTexts,
            cookTimeMinutes: Number(form.getValues("cookTime") || 0),
        })
        setIsGeneratingWithAI(false)

        if (result.error || !result.steps?.length) {
            toast.error(result.error || commonT("errorSaving"))
            return
        }

        const generatedSteps = result.steps.map((step: string) => ({ 
            text: { [locale]: step },
            duration_seconds: null 
        }))
        form.setValue(namePrefix, generatedSteps, { shouldDirty: true })
        setIsAdding(false)
        setEditingIndex(null)
        toast.success(t("generatedWithAI"))
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <h2 className="font-semibold text-xs text-secondary dark:text-white whitespace-nowrap">{t("preparationMode")}</h2>
                    <div className="h-px w-full bg-border/60" />
                </div>
                {!isAdding && editingIndex === null && (
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleGenerateAllSteps}
                            disabled={isGeneratingWithAI}
                            className="h-8 w-auto min-w-[80px] justify-center px-4 text-xs font-semibold border-border/50 bg-transparent text-muted-foreground hover:bg-muted/5 rounded-lg transition-all gap-2"
                        >
                            {isGeneratingWithAI ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 opacity-60" />}
                            {t("generateWithAI")}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsAdding(true)}
                            className="h-8 w-auto min-w-[80px] justify-center px-4 text-xs font-semibold border-border/50 bg-transparent text-muted-foreground hover:bg-muted/5 rounded-lg transition-all gap-2"
                        >
                            <Plus className="h-3.5 w-3.5 opacity-50" />
                            {commonT("add")}
                        </Button>
                    </div>
                )}
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
            >
                <SortableContext
                    items={fields.map((f: any) => f.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-4">
                        {fields.map((field, index) => {
                            const isEditing = editingIndex === index
                            const stepData = form.watch(`${namePrefix}.${index}`) || {}
                            const textData = stepData.text || stepData
                            const displayText = textData[locale] || textData['en'] || Object.values(textData)[0] || t("emptyStep")
                            const durationSeconds = stepData.duration_seconds

                            return (
                                <SortableStepItem
                                    key={field.id}
                                    field={field}
                                    index={index}
                                    isEditing={isEditing}
                                    displayText={displayText as string}
                                    durationSeconds={durationSeconds}
                                    locale={locale}
                                    commonT={commonT}
                                    t={t}
                                    startEditing={startEditing}
                                    cancelEditing={cancelEditing}
                                    stopEditing={stopEditing}
                                    remove={remove}
                                    form={form}
                                    namePrefix={namePrefix}
                                />
                            )
                        })}

                        {fields.length === 0 && !isAdding && (
                            <div className="flex flex-col items-center justify-center py-6 px-6 rounded-lg bg-muted/5 border-2 border-dashed border-border/40">
                                <p className="text-[10px] font-semibold text-muted-foreground/40">
                                    {t("noPrepSteps")}
                                </p>
                            </div>
                        )}
                    </div>
                </SortableContext>
            </DndContext>

            {isAdding && (
                <div className="p-8 rounded-3xl border border-border/60 bg-muted/5 space-y-8 animate-in fade-in zoom-in-95 duration-300">
                    <TranslationFields
                        form={form}
                        namePrefix="newPrepStep.text"
                        label={`${t("step")} ${fields.length + 1}`}
                        type="textarea"
                        placeholder={t("stepPlaceholder")}
                        isRichText={true}
                        headerActions={
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                                    {t("stepDuration")}
                                </span>
                                <TimeDurationInput
                                    value={form.watch("newPrepStep.duration_seconds")}
                                    onChange={(val) => form.setValue("newPrepStep.duration_seconds", val, { shouldDirty: true })}
                                />
                            </div>
                        }
                    />
                    <div className="flex justify-end gap-3 pt-6 border-t border-border/40">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={cancelAdding}
                            className="h-10 px-6 font-semibold text-xs border-border hover:bg-muted/30 transition-colors"
                        >
                            {commonT("cancel")}
                        </Button>
                        <Button
                            type="button"
                            onClick={handleAddStep}
                            disabled={!hasNewStepData}
                            className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-sm shadow-primary/5 transition-all active:scale-[0.98]"
                        >
                            {commonT("add")}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
