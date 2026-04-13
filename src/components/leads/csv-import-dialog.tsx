"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import Papa from "papaparse"
import { bulkUpsertLeadsAction } from "@/app/actions/leads"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CsvImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

interface ParsedLead {
    name: string;
    email?: string | null;
    phone?: string | null;
    status: 'ready' | 'warning' | 'error';
    error?: string;
}

const WIX_SEMICOLON_DETECTION_THRESHOLD = 3;

export function CsvImportDialog({ open, onOpenChange, onSuccess }: CsvImportDialogProps) {
    const t = useTranslations("Leads")
    const commonT = useTranslations("Common")
    const [file, setFile] = React.useState<File | null>(null)
    const [isParsing, setIsParsing] = React.useState(false)
    const [isImporting, setIsImporting] = React.useState(false)
    const [progress, setProgress] = React.useState(0)
    const [processedCount, setProcessedCount] = React.useState(0)
    const [mappedData, setMappedData] = React.useState<ParsedLead[]>([])
    const [filter, setFilter] = React.useState<'all' | 'ready' | 'warning' | 'error'>('all')
    const [isDragging, setIsDragging] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    // Reset state when dialog opens/closes
    React.useEffect(() => {
        if (!open) {
            setFile(null)
            setMappedData([])
            setIsParsing(false)
            setIsImporting(false)
            setProgress(0)
            setProcessedCount(0)
            setFilter('all')
            setIsDragging(false)
        }
    }, [open])

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const droppedFile = e.dataTransfer.files?.[0]
        if (droppedFile) {
            if (!droppedFile.name.endsWith('.csv')) {
                toast.error(commonT("invalidFormat") || "Please upload a valid CSV file.")
                return
            }
            setFile(droppedFile)
            processCsv(droppedFile)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0]
        if (!selected) return

        if (!selected.name.endsWith('.csv')) {
            toast.error(commonT("invalidFormat") || "Please upload a valid CSV file.")
            return
        }

        setFile(selected)
        processCsv(selected)
    }

    const processCsv = async (csvFile: File) => {
        setIsParsing(true)
        setMappedData([])
        
        const reader = new FileReader()
        reader.onload = (e) => {
            const text = e.target?.result as string
            if (!text) return

            // Split into raw lines (including those inside quotes)
            const rawLines = text.split(/\r?\n/)
            if (rawLines.length === 0) {
                setIsParsing(false)
                return
            }

            // 1. Identify Header and Delimiter
            const headerLine = rawLines[0]
            const delimiter = headerLine.includes(',') ? ',' : ';'
            const expectedColumns = headerLine.split(delimiter).length

            // 2. Smart Stitcher: Reconstruct records that have internal newlines
            const records: string[] = []
            let buffer = ""
            
            const countChar = (str: string, char: string) => {
                let count = 0
                for (const c of str) if (c === char) count++
                return count
            }

            // Skip the header line in the loop, we already have it
            for (let i = 1; i < rawLines.length; i++) {
                const line = rawLines[i] // Don't trim yet, leading whitespace might be part of the field
                if (!line && !buffer) continue 

                buffer += (buffer ? "\n" : "") + line
                
                // Logic for "Complete Record":
                // 1. Delimiter count >= expected headers
                // 2. Quotes are balanced (even number of " characters)
                // 3. Or it ends with the Wix terminator (literal ; or empty column at end)
                
                const delimiterCount = buffer.split(delimiter).length
                const quoteCount = countChar(buffer, '"')
                const isQuotesBalanced = quoteCount % 2 === 0
                const hasTerminator = buffer.trim().endsWith(';')
                
                if ((delimiterCount >= expectedColumns && isQuotesBalanced) || (hasTerminator && isQuotesBalanced)) {
                    records.push(buffer)
                    buffer = ""
                }
            }
            
            // Handle last hanging buffer
            if (buffer) records.push(buffer)

            // 3. Parse Reconstructed Records
            const headers = headerLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''))
            
            const processed: ParsedLead[] = []
            const nameMatch = ["first name", "nome", "name", "display name", "contact name", "identificação"]
            const lastNameMatch = ["last name", "sobrenome", "apelido"]
            const emailMatch = ["email", "emails", "e-mail", "correio"]
            const phoneMatch = ["phone", "telefone", "telem", "mobile", "telemóvel"]
            const fullMatch = ["full name", "nome completo"]

            // Map columns once
            let firstNameIdx = -1, lastNameIdx = -1, emailIdx = -1, phoneIdx = -1, fullNameIdx = -1

            headers.forEach((h, idx) => {
                const lhead = h.toLowerCase()
                if (firstNameIdx === -1 && nameMatch.some(m => lhead === m || (lhead.includes(m) && !lhead.includes('last')))) firstNameIdx = idx
                if (lastNameIdx === -1 && lastNameMatch.some(m => lhead.includes(m))) lastNameIdx = idx
                if (emailIdx === -1 && emailMatch.some(m => lhead.includes(m))) emailIdx = idx
                if (phoneIdx === -1 && phoneMatch.some(m => lhead.includes(m))) phoneIdx = idx
                if (fullNameIdx === -1 && fullMatch.some(m => lhead.includes(m))) fullNameIdx = idx
            })

            // Process records
            records.forEach(rec => {
                let cleanRec = rec.trim().replace(/;$/, '').trim()
                
                // Parse the stitched record using Papa to handle quotes correctly within fields
                let { data } = Papa.parse(cleanRec, { delimiter, quoteChar: '"' })
                let row = (data[0] as string[]) || []

                // Wix "Whole Record Quoting" Fix:
                // If the entire record is wrapped in quotes, it means Wix escaped everything.
                // We need to unwrap it and unescape doubled quotes before re-parsing.
                if (row.length === 1 && cleanRec.includes(delimiter)) {
                    if (cleanRec.startsWith('"') && cleanRec.endsWith('"')) {
                        const unwrapped = cleanRec.substring(1, cleanRec.length - 1).replace(/""/g, '"')
                        const retry = Papa.parse(unwrapped, { delimiter, quoteChar: '"' })
                        row = (retry.data[0] as string[]) || []
                    }
                }
                
                const cleanValue = (val: string) => (val || "").toString().replace(/^["']|["']$/g, '').replace(/;$/, '').trim()

                const fName = firstNameIdx !== -1 ? cleanValue(row[firstNameIdx]) : ""
                const lName = lastNameIdx !== -1 ? cleanValue(row[lastNameIdx]) : ""
                const full = fullNameIdx !== -1 ? cleanValue(row[fullNameIdx]) : ""
                const email = emailIdx !== -1 ? cleanValue(row[emailIdx]) : null
                const phone = phoneIdx !== -1 ? cleanValue(row[phoneIdx]) : null
                
                let finalName = full || `${fName} ${lName}`.trim()

                // Filter out clear trash or empty
                if (!finalName && !email && !phone) return
                
                processed.push({
                    name: finalName || (email ? email.split('@')[0] : "Contato Importado"),
                    email: email || null,
                    phone: phone || null,
                    status: email ? 'ready' : 'warning'
                })
            })

            setMappedData(processed)
            setIsParsing(false)
        }

        reader.onerror = () => {
            toast.error("Error reading file.")
            setIsParsing(false)
        }

        reader.readAsText(csvFile)
    }

    const handleImport = async () => {
        if (mappedData.length === 0) return

        setIsImporting(true)
        setProgress(0)
        setProcessedCount(0)

        const batchSize = 50
        const totalLeads = mappedData.length
        let totalSucceeded = 0

        try {
            for (let i = 0; i < totalLeads; i += batchSize) {
                const batch = mappedData.slice(i, i + batchSize)
                const result = await bulkUpsertLeadsAction(batch)
                
                if (result.success) {
                    totalSucceeded += result.summary?.succeeded || 0
                    const newProcessedCount = Math.min(i + batchSize, totalLeads)
                    setProcessedCount(newProcessedCount)
                    setProgress(Math.round((newProcessedCount / totalLeads) * 100))
                }
            }

            toast.success(t("importSuccess") || `${totalSucceeded} leads successfully imported/updated!`)
            if (onSuccess) onSuccess()
            onOpenChange(false)
        } catch (error) {
            console.error("Import process halted by error:", error)
            toast.error(t("importError") || "There was an error importing some leads.")
        } finally {
            setIsImporting(false)
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
    }

    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 
            'bg-amber-500', 'bg-rose-500', 'bg-indigo-500', 'bg-cyan-500'
        ]
        let hash = 0
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash)
        }
        return colors[Math.abs(hash) % colors.length]
    }

    const filteredData = React.useMemo(() => {
        if (filter === 'all') return mappedData
        return mappedData.filter(d => d.status === filter)
    }, [mappedData, filter])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-background border-border/40 shadow-2xl rounded-2xl">
                {/* Premium Header Design - Condensed */}
                <div className="relative px-6 pt-6 pb-4 border-b border-border/10 bg-gradient-to-br from-slate-50 to-white dark:from-white/[0.02] dark:to-transparent">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <UploadCloud className="size-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold tracking-tight text-secondary dark:text-foreground">
                                {t("importCsv") || "Import Leads"}
                            </DialogTitle>
                            <DialogDescription className="text-xs font-medium text-muted-foreground/70 mt-0.5">
                                {t("importCsvDescription") || "Batch process leads for your marketing pipeline."}
                            </DialogDescription>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {!file ? (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed transition-all duration-300 rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer min-h-[350px] group relative overflow-hidden ${
                                isDragging 
                                ? "border-primary bg-primary/5 scale-[0.99]" 
                                : "border-border/40 hover:border-primary/40 hover:bg-primary/[0.02]"
                            }`}
                        >
                            {/* Animated Background Mesh */}
                            <div className={`absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent transition-opacity duration-500 ${isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                            
                            <input 
                                type="file" 
                                accept=".csv" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleFileChange}
                            />
                            <div className={`size-14 rounded-2xl bg-white dark:bg-white/5 shadow-lg border border-border/10 flex items-center justify-center mb-4 transition-all duration-500 ease-out ${isDragging ? "scale-110 -translate-y-1 ring-4 ring-primary/20" : "group-hover:scale-110 group-hover:-translate-y-1"}`}>
                                <FileSpreadsheet className={`size-7 transition-colors ${isDragging ? "text-primary" : "text-primary opacity-80"}`} />
                            </div>
                            <h3 className="text-lg font-bold text-secondary dark:text-white mt-1 tracking-tight">
                                {isDragging ? "Drop your file now" : "Drop Wix CSV file here"}
                            </h3>
                            <p className="text-xs font-medium text-muted-foreground/60 mt-2 max-w-[200px] text-center leading-relaxed">
                                {isDragging ? "Release to start the analysis" : "Click to browse or drag and drop your contact export."}
                            </p>
                            <div className="mt-6 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80">
                                Supports UTF-8 CSV Only
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Active File Header */}
                            <div className="flex items-center justify-between p-6 rounded-2xl bg-primary/5 border border-primary/10 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="size-14 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center shadow-md border border-white/20">
                                        <FileSpreadsheet className="size-7 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-secondary dark:text-white tracking-tight leading-none mb-1">{file.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10">{mappedData.length} records</span>
                                            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tighter">— Auto-mapped Wix Schema</span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setFile(null)} disabled={isImporting} className="rounded-xl h-10 px-4 hover:bg-white/50 dark:hover:bg-white/10 text-muted-foreground hover:text-destructive transition-colors">
                                    Change File
                                </Button>
                            </div>

                            {/* Data Preview */}
                            {isParsing ? (
                                <div className="flex flex-col items-center justify-center py-24 gap-4">
                                    <div className="relative">
                                        <div className="size-12 rounded-full border-2 border-primary/20" />
                                        <Loader2 className="size-12 animate-spin text-primary absolute inset-0" />
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Analyzing structures...</p>
                                </div>
                            ) : mappedData.length > 0 ? (
                                <div className="space-y-6">
                                    {/* Analysis Summary Bar - Condensed */}
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { 
                                                id: 'ready' as const,
                                                label: t("summary_ready", { count: mappedData.filter(d => d.status === 'ready').length }), 
                                                icon: CheckCircle2, 
                                                color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' 
                                            },
                                            { 
                                                id: 'warning' as const,
                                                label: t("summary_warning", { count: mappedData.filter(d => d.status === 'warning').length }), 
                                                icon: AlertCircle, 
                                                color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' 
                                            },
                                            { 
                                                id: 'error' as const,
                                                label: t("summary_error", { count: mappedData.filter(d => d.status === 'error').length }), 
                                                icon: AlertCircle, 
                                                color: 'text-rose-600 bg-rose-500/10 border-rose-500/20' 
                                            }
                                        ].map((item) => (
                                            <button 
                                                key={item.id} 
                                                onClick={() => setFilter(filter === item.id ? 'all' : item.id)}
                                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${item.color} shadow-sm transition-all hover:scale-[1.02] active:scale-95 ${
                                                    filter === item.id 
                                                    ? "ring-2 ring-primary/40 shadow-lg scale-[1.02] opacity-100" 
                                                    : filter === 'all' ? "opacity-100" : "opacity-40 grayscale-[0.5]"
                                                }`}
                                            >
                                                <item.icon className="size-3.5 shrink-0" />
                                                <span className="text-[10px] font-bold tracking-tight uppercase">{item.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between px-1">
                                        <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                                            {filter === 'all' ? t("preview") || "Extraction Preview" : `${filter.toUpperCase()} ${t("preview") || "Preview"}`}
                                        </h4>
                                        <div className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-tighter">
                                            {filter === 'all' 
                                                ? `${mappedData.length} total records` 
                                                : `Showing ${filteredData.length} of ${mappedData.length} records`}
                                        </div>
                                    </div>
                                    
                                    <div className="rounded-xl border border-border/40 overflow-hidden bg-white dark:bg-black/20 shadow-lg">
                                        <ScrollArea className="h-[280px]">
                                            <div className="min-w-[600px]">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-slate-50/50 dark:bg-white/[0.02] sticky top-0 z-10 backdrop-blur-md">
                                                            <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 border-b border-border/40 bg-slate-50/50 dark:bg-slate-900/50">Contact</th>
                                                            <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 border-b border-border/40 bg-slate-50/50 dark:bg-slate-900/50">Details</th>
                                                            <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 border-b border-border/40 bg-slate-50/50 dark:bg-slate-900/50 text-center">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border/10">
                                                        {filteredData.map((row, i) => (
                                                            <tr key={i} className="group hover:bg-primary/[0.01] transition-colors">
                                                                <td className="px-4 py-3 border-b border-border/5 last:border-0 max-w-[250px]">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`size-8 rounded-lg ${getAvatarColor(row.name)} flex items-center justify-center text-white text-[10px] font-extrabold shadow-sm shrink-0`}>
                                                                            {getInitials(row.name)}
                                                                        </div>
                                                                        <div className="truncate">
                                                                            <div className="text-xs font-bold text-secondary dark:text-white leading-tight truncate">{row.name}</div>
                                                                            {row.error && (
                                                                                <div className="text-[8px] text-rose-500 font-bold uppercase tracking-tighter mt-0.5 truncate">{row.error}</div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 border-b border-border/5 last:border-0">
                                                                    <div className="flex flex-col gap-0.5">
                                                                        {row.email ? (
                                                                            <div className="inline-flex items-center text-blue-600 dark:text-blue-400 font-bold text-[11px] hover:underline cursor-default truncate max-w-[180px]">
                                                                                {row.email}
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-muted-foreground/30 text-[9px] italic">— No Email</span>
                                                                        )}
                                                                        {row.phone && (
                                                                            <div className="flex items-center gap-1.5 text-muted-foreground/60 font-medium text-[9px] tracking-tight">
                                                                                <div className="size-1 rounded-full bg-border/40" />
                                                                                {row.phone}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 border-b border-border/5 last:border-0 text-center">
                                                                    {row.status === 'ready' && (
                                                                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[9px] font-bold uppercase tracking-wider border border-emerald-500/20">
                                                                            <CheckCircle2 className="size-2.5" />
                                                                            {t("status_ready")}
                                                                        </div>
                                                                    )}
                                                                    {row.status === 'warning' && (
                                                                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[9px] font-bold uppercase tracking-wider border border-amber-500/20">
                                                                            <AlertCircle className="size-2.5" />
                                                                            {t("status_missing_email")}
                                                                        </div>
                                                                    )}
                                                                    {row.status === 'error' && (
                                                                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 text-[9px] font-bold uppercase tracking-wider border border-rose-500/20">
                                                                            <AlertCircle className="size-2.5" />
                                                                            {t("status_invalid")}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center bg-amber-500/[0.03] rounded-3xl border border-amber-500/10">
                                    <div className="size-16 rounded-3xl bg-amber-500/10 flex items-center justify-center mb-5">
                                        <AlertCircle className="size-8 text-amber-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-amber-700 tracking-tight">Parser Mismatch</h3>
                                    <p className="text-sm font-medium text-amber-900/40 mt-2 max-w-[320px] leading-relaxed">
                                        We could not identify Name or Email headers. Please check your Wix CSV formatting.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="px-6 py-6 border-t border-border/40 bg-slate-50/50 dark:bg-white/[0.01]">
                    <div className="flex w-full items-center justify-between">
                        {!isImporting ? (
                            <>
                                <Button 
                                    variant="ghost" 
                                    onClick={() => onOpenChange(false)} 
                                    disabled={isImporting} 
                                    className="h-10 px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all"
                                >
                                    {commonT("cancel")}
                                </Button>
                                <Button 
                                    onClick={handleImport} 
                                    disabled={!file || mappedData.length === 0 || isImporting || isParsing}
                                    className="h-10 bg-primary hover:bg-primary/90 text-white font-bold text-xs px-8 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    <CheckCircle2 className="size-3.5" /> {t("confirmImport") || "Import Data"}
                                </Button>
                            </>
                        ) : (
                            <div className="w-full space-y-3 py-1">
                                <div className="flex items-center justify-between mb-0.5">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="size-3 animate-spin text-primary" />
                                        <span className="text-xs font-bold text-secondary dark:text-white">
                                            {t("importing_leads") || "Importing leads..." }
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground">
                                        {t("processed_of", { count: processedCount, total: mappedData.length }) || `${processedCount} of ${mappedData.length} leads processed`}
                                    </span>
                                </div>
                                
                                {/* Custom Progress Bar */}
                                <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-border/10">
                                    <div 
                                        className="h-full bg-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(var(--primary),0.3)]" 
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                
                                <p className="text-[9px] font-medium text-muted-foreground/60 text-center animate-pulse italic">
                                    {t("keep_window_open") || "Please keep this tab open. You can open a new tab to continue working elsewhere."}
                                </p>
                            </div>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
