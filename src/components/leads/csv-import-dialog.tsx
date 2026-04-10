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

interface CsvImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

interface ParsedLead {
    name: string;
    email?: string | null;
    phone?: string | null;
}

export function CsvImportDialog({ open, onOpenChange, onSuccess }: CsvImportDialogProps) {
    const t = useTranslations("Leads")
    const commonT = useTranslations("Common")
    const [file, setFile] = React.useState<File | null>(null)
    const [isParsing, setIsParsing] = React.useState(false)
    const [isImporting, setIsImporting] = React.useState(false)
    const [mappedData, setMappedData] = React.useState<ParsedLead[]>([])
    const [isDragging, setIsDragging] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    // Reset state when dialog opens/closes
    React.useEffect(() => {
        if (!open) {
            setFile(null)
            setMappedData([])
            setIsParsing(false)
            setIsImporting(false)
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

    const processCsv = (csvFile: File) => {
        setIsParsing(true)
        
        // Read file as text first to handle Wix "wrapped" lines
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) {
                setIsParsing(false);
                return;
            }

            // Pre-process text to handle Wix weirdness (trailing semicolons and whole-line quotes)
            const cleanLines = text.split(/\r?\n/).map(line => {
                let clean = line.trim();
                // Strip trailing semicolon if it exists
                if (clean.endsWith(';')) clean = clean.slice(0, -1);
                // Strip leading/trailing quotes IF it wraps the whole line (Wix style)
                if (clean.startsWith('"') && clean.endsWith('"') && clean.includes(',')) {
                    // But only if we detect internal commas that look like they should be tokens
                    clean = clean.slice(1, -1);
                }
                return clean;
            }).join('\n');

            Papa.parse(cleanLines, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const data = results.data as Record<string, string>[]
                    
                    if (data.length === 0) {
                        toast.error("CSV is empty.")
                        setIsParsing(false)
                        return
                    }

                    // Identify columns based on common Portuguese / English headers
                    const headers = Object.keys(data[0])
                    
                    let firstNameCol: string | null = null
                    let lastNameCol: string | null = null
                    let emailCol: string | null = null
                    let phoneCol: string | null = null

                    for (const header of headers) {
                        const lhead = header.toLowerCase().trim()
                        // First Name match
                        if (!firstNameCol && (lhead.includes('nome') && !lhead.includes('sobrenome') || lhead.includes('first name'))) {
                            firstNameCol = header
                        }
                        // Last Name match
                        if (!lastNameCol && (lhead.includes('sobrenome') || lhead.includes('last name'))) {
                            lastNameCol = header
                        }
                        // Email match
                        if (!emailCol && lhead.includes('email')) {
                            emailCol = header
                        }
                        // Phone match
                        if (!phoneCol && (lhead.includes('telefon') || lhead.includes('phone') || lhead.includes('telem'))) {
                            phoneCol = header
                        }
                    }

                    // Map row data
                    const processed: ParsedLead[] = []
                    for (const row of data) {
                        const fName = firstNameCol ? (row[firstNameCol] || "").trim() : ""
                        const lName = lastNameCol ? (row[lastNameCol] || "").trim() : ""
                        const email = emailCol ? (row[emailCol] || "").trim() : null
                        const phone = phoneCol ? (row[phoneCol] || "").trim() : null
                        
                        const fullName = `${fName} ${lName}`.trim()
                        
                        // Only add if there is at least a name or an email
                        if (fullName || email) {
                            processed.push({
                                name: fullName || "Contato sem nome",
                                email: email || null,
                                phone: phone || null
                            })
                        }
                    }

                    setMappedData(processed)
                    setIsParsing(false)
                },
                error: (err: any) => {
                    console.error("PapaParse error:", err)
                    toast.error(commonT("errorSaving") || "Error parsing CSV.")
                    setIsParsing(false)
                }
            });
        };
        reader.onerror = () => {
            toast.error("Error reading file.");
            setIsParsing(false);
        };
        reader.readAsText(csvFile);
    }

    const handleImport = async () => {
        if (mappedData.length === 0) return

        setIsImporting(true)
        const result = await bulkUpsertLeadsAction(mappedData)
        setIsImporting(false)

        if (result.success) {
            toast.success(t("importSuccess") || `${result.summary?.succeeded} leads successfully imported/updated!`)
            if (onSuccess) onSuccess()
            onOpenChange(false)
        } else {
            toast.error(t("importError") || "There was an error importing some leads.")
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-background border-border/40 shadow-2xl rounded-2xl">
                {/* Premium Header Design */}
                <div className="relative px-10 pt-10 pb-8 border-b border-border/10 bg-gradient-to-br from-slate-50 to-white dark:from-white/[0.02] dark:to-transparent">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <UploadCloud className="size-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-3xl font-semibold tracking-tight text-secondary dark:text-foreground">
                                {t("importCsv") || "Import Leads"}
                            </DialogTitle>
                            <DialogDescription className="text-sm font-medium text-muted-foreground/70 mt-1">
                                {t("importCsvDescription") || "Batch process leads for your marketing pipeline."}
                            </DialogDescription>
                        </div>
                    </div>
                </div>

                <div className="p-10">
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
                            <div className={`size-20 rounded-3xl bg-white dark:bg-white/5 shadow-xl border border-border/10 flex items-center justify-center mb-6 transition-all duration-500 ease-out ${isDragging ? "scale-110 -translate-y-2 ring-4 ring-primary/20" : "group-hover:scale-110 group-hover:-translate-y-2"}`}>
                                <FileSpreadsheet className={`size-10 transition-colors ${isDragging ? "text-primary" : "text-primary opacity-80"}`} />
                            </div>
                            <h3 className="text-xl font-bold text-secondary dark:text-white mt-2 tracking-tight">
                                {isDragging ? "Drop your file now" : "Drop Wix CSV file here"}
                            </h3>
                            <p className="text-sm font-medium text-muted-foreground/60 mt-3 max-w-[240px] text-center leading-relaxed">
                                {isDragging ? "Release to start the analysis" : "Click to browse or drag and drop your contact export."}
                            </p>
                            <div className="mt-8 px-5 py-2 rounded-full bg-slate-100 dark:bg-white/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
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
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                                            {t("preview") || "Extraction Preview"}
                                        </h4>
                                        <div className="text-[10px] font-medium text-muted-foreground/40">Showing top 5 samples</div>
                                    </div>
                                    
                                    <div className="rounded-2xl border border-border/40 overflow-hidden bg-white dark:bg-black/20 shadow-sm transition-all hover:shadow-md">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50/50 dark:bg-white/[0.02]">
                                                        <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 border-b border-border/40">Contact Info</th>
                                                        <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 border-b border-border/40">Email Address</th>
                                                        <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 border-b border-border/40">Phone Number</th>
                                                        <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 border-b border-border/40 text-center">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/20">
                                                    {mappedData.slice(0, 5).map((row, i) => (
                                                        <tr key={i} className="group hover:bg-primary/[0.01] transition-colors">
                                                            <td className="px-6 py-6 border-b border-border/10 last:border-0">
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`size-10 rounded-xl ${getAvatarColor(row.name)} flex items-center justify-center text-white text-xs font-bold shadow-md ring-4 ring-white dark:ring-white/5`}>
                                                                        {getInitials(row.name)}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm font-bold text-secondary dark:text-white leading-tight mb-0.5">{row.name}</div>
                                                                        <div className="text-[10px] text-muted-foreground/60 font-medium">Auto-extracted</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-6 border-b border-border/10 last:border-0">
                                                                {row.email ? (
                                                                    <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-500/5 text-blue-600 dark:text-blue-400 font-medium text-[13px] border border-blue-500/10">
                                                                        {row.email}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted-foreground/30 text-xs italic">— Not found</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-6 border-b border-border/10 last:border-0">
                                                                {row.phone ? (
                                                                    <span className="text-xs font-bold text-muted-foreground tracking-wide">{row.phone}</span>
                                                                ) : (
                                                                    <span className="text-muted-foreground/30 text-xs">—</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-6 border-b border-border/10 last:border-0 text-center">
                                                                <div className="size-6 rounded-full bg-emerald-500/10 flex items-center justify-center m-auto">
                                                                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {mappedData.length > 5 && (
                                            <div className="bg-slate-50/80 dark:bg-white/[0.01] p-4 text-center border-t border-border/20">
                                                <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                                    + {mappedData.length - 5} additional contacts pending
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center bg-amber-500/[0.03] rounded-3xl border border-amber-500/10">
                                    <div className="size-16 rounded-3xl bg-amber-500/10 flex items-center justify-center mb-5">
                                        <AlertCircle className="size-8 text-amber-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-amber-700 tracking-tight">Parser Mismatch</h3>
                                    <p className="text-sm font-medium text-amber-900/40 mt-2 max-w-[320px] leading-relaxed">
                                        We couldn't identify Name or Email headers. Please check your Wix CSV formatting.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="px-10 py-8 border-t border-border/40 bg-slate-50/50 dark:bg-white/[0.01]">
                    <div className="flex w-full items-center justify-between">
                        <Button 
                            variant="ghost" 
                            onClick={() => onOpenChange(false)} 
                            disabled={isImporting} 
                            className="h-12 px-8 rounded-xl font-bold text-xs text-muted-foreground hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all"
                        >
                            {commonT("cancel")}
                        </Button>
                        <Button 
                            onClick={handleImport} 
                            disabled={!file || mappedData.length === 0 || isImporting || isParsing}
                            className="h-12 bg-primary hover:bg-primary/90 text-white font-bold text-sm px-10 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-3"
                        >
                            {isImporting ? (
                                <><Loader2 className="size-4 animate-spin" /> {t("importing") || "Syncing Records..."}</>
                            ) : (
                                <><CheckCircle2 className="size-4" /> {t("confirmImport") || "Import Data"}</>
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
