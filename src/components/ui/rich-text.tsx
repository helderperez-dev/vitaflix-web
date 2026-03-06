"use client"

import * as React from "react"
import {
    Bold, Italic, List, ListOrdered, Undo, Redo,
    Underline as UnderlineIcon, Heading3, Quote,
    Highlighter, Image as ImageIcon, Link as LinkIcon,
    Code as CodeIcon, Eye, Paperclip, Loader2
} from "lucide-react"
import { uploadNotificationImageAction } from "@/app/actions/notifications"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Textarea } from "./textarea"
import { PlaceholderSelector } from "@/components/notifications/placeholder-selector"

interface RichTextProps {
    value?: string
    onChange?: (value: string) => void
    placeholder?: string
    className?: string
    onPlaceholderSelect?: (placeholder: string) => void
}

export function RichText({ value, onChange, placeholder, className }: RichTextProps) {
    const editorRef = React.useRef<HTMLDivElement>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const [isFocused, setIsFocused] = React.useState(false)
    const [isUploading, setIsUploading] = React.useState(false)
    const [mode, setMode] = React.useState<"visual" | "html">("visual")
    const [commandState, setCommandState] = React.useState({
        bold: false,
        italic: false,
        underline: false,
        insertUnorderedList: false,
        insertOrderedList: false,
        isHeading: false,
        isQuote: false
    })

    const updateCommandState = React.useCallback(() => {
        if (typeof document !== 'undefined') {
            try {
                setCommandState({
                    bold: document.queryCommandState("bold"),
                    italic: document.queryCommandState("italic"),
                    underline: document.queryCommandState("underline"),
                    insertUnorderedList: document.queryCommandState("insertUnorderedList"),
                    insertOrderedList: document.queryCommandState("insertOrderedList"),
                    isHeading: document.queryCommandValue("formatBlock") === "h3",
                    isQuote: document.queryCommandValue("formatBlock") === "blockquote"
                })
            } catch (e) {
                // Ignore errors from queryCommandState when not supported
            }
        }
    }, [])

    React.useEffect(() => {
        if (editorRef.current && mode === "visual" && !isFocused && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value || ""
        }
    }, [value, isFocused, mode])

    const handleInput = () => {
        if (editorRef.current && mode === "visual") {
            const content = editorRef.current.innerHTML
            onChange?.(content)
            updateCommandState()
        }
    }

    const execCommand = (command: string, val?: string) => {
        if (editorRef.current) {
            editorRef.current.focus()
            document.execCommand(command, false, val)
            handleInput()
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setIsUploading(true)
            const formData = new FormData()
            formData.append("file", file)

            try {
                const { success, url, error } = await uploadNotificationImageAction(formData)
                if (success && url) {
                    execCommand("insertImage", url)
                } else {
                    toast.error(error || "Failed to upload image")
                }
            } catch (err) {
                toast.error("An error occurred during upload")
            } finally {
                setIsUploading(false)
                if (fileInputRef.current) fileInputRef.current.value = ""
            }
        }
    }

    const insertPlaceholder = (ph: string) => {
        if (mode === "visual") {
            execCommand("insertText", ph)
        } else {
            const cursorPosition = 0; // Ideally we'd keep track of cursor in textarea
            const newValue = (value || "").slice(0, cursorPosition) + ph + (value || "").slice(cursorPosition)
            onChange?.(newValue)
        }
    }

    const ToolbarButton = ({
        icon: Icon,
        command,
        commandValue,
        active = false,
        label,
        showActive = true,
        onClick
    }: {
        icon: any,
        command?: string,
        commandValue?: string,
        active?: boolean,
        label: string,
        showActive?: boolean,
        onClick?: () => void
    }) => (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onMouseDown={(e) => {
                e.preventDefault()
                if (onClick) onClick()
                else if (command) execCommand(command, commandValue)
            }}
            className={cn(
                "h-8 w-8 rounded-lg transition-all duration-200",
                active && showActive
                    ? "bg-primary/10 text-primary scale-105"
                    : "text-muted-foreground/60 hover:text-primary hover:bg-primary/5 active:scale-90"
            )}
            title={label}
        >
            <Icon className="h-4 w-4" />
        </Button>
    )

    const [resizingImage, setResizingImage] = React.useState<{
        img: HTMLImageElement;
        startWidth: number;
        startX: number;
    } | null>(null);

    const handleMouseMove = React.useCallback((e: MouseEvent) => {
        if (!resizingImage) return;

        const deltaX = e.clientX - resizingImage.startX;
        const newWidth = Math.max(50, resizingImage.startWidth + deltaX);

        resizingImage.img.style.width = `${newWidth}px`;
        resizingImage.img.style.height = 'auto'; // Maintain aspect ratio
        handleInput();
    }, [resizingImage]);

    const handleMouseUp = React.useCallback(() => {
        if (resizingImage) {
            setResizingImage(null);
            document.body.style.cursor = 'default';
        }
    }, [resizingImage]);

    React.useEffect(() => {
        if (resizingImage) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'nwse-resize';
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizingImage, handleMouseMove, handleMouseUp]);

    return (
        <div className={cn(
            "flex flex-col rounded-xl border border-border/40 bg-muted/5 transition-all duration-300 overflow-hidden",
            isFocused && "ring-4 ring-primary/5 border-primary/20 bg-background shadow-md",
            className
        )}>
            {/* Toolbar */}
            <div className="flex items-center flex-wrap gap-1 p-2 border-b border-border/10 bg-muted/10 backdrop-blur-sm">
                <div className="flex bg-muted/20 p-1 rounded-lg mr-1 gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setMode("visual")}
                        className={cn(
                            "h-7 px-2 text-[10px] font-bold uppercase tracking-tight rounded-md transition-all",
                            mode === "visual" ? "bg-white dark:bg-muted shadow-sm text-primary" : "text-muted-foreground/40 hover:text-muted-foreground"
                        )}
                    >
                        <Eye className="size-3 mr-1.5" />
                        Visual
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setMode("html")}
                        className={cn(
                            "h-7 px-2 text-[10px] font-bold uppercase tracking-tight rounded-md transition-all",
                            mode === "html" ? "bg-white dark:bg-muted shadow-sm text-primary" : "text-muted-foreground/40 hover:text-muted-foreground"
                        )}
                    >
                        <CodeIcon className="size-3 mr-1.5" />
                        HTML
                    </Button>
                </div>

                <div className="w-px h-4 bg-border/20 mx-1" />

                {mode === "visual" && (
                    <>
                        <ToolbarButton
                            icon={Bold}
                            command="bold"
                            active={commandState.bold}
                            label="Bold"
                        />
                        <ToolbarButton
                            icon={Italic}
                            command="italic"
                            active={commandState.italic}
                            label="Italic"
                        />
                        <ToolbarButton
                            icon={UnderlineIcon}
                            command="underline"
                            active={commandState.underline}
                            label="Underline"
                        />

                        <div className="w-px h-4 bg-border/20 mx-1" />

                        <ToolbarButton
                            icon={Heading3}
                            command="formatBlock"
                            commandValue="h3"
                            active={commandState.isHeading}
                            label="Heading"
                        />
                        <ToolbarButton
                            icon={Quote}
                            command="formatBlock"
                            commandValue="blockquote"
                            active={commandState.isQuote}
                            label="Quote"
                        />

                        <div className="w-px h-4 bg-border/20 mx-1" />

                        <ToolbarButton
                            icon={List}
                            command="insertUnorderedList"
                            active={commandState.insertUnorderedList}
                            label="Bullet List"
                        />
                        <ToolbarButton
                            icon={ListOrdered}
                            command="insertOrderedList"
                            active={commandState.insertOrderedList}
                            label="Numbered List"
                        />

                        <div className="w-px h-4 bg-border/20 mx-1" />

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                        <ToolbarButton
                            icon={isUploading ? Loader2 : ImageIcon}
                            label="Insert Image"
                            onClick={() => !isUploading && fileInputRef.current?.click()}
                            active={isUploading}
                        />
                    </>
                )}

                <div className="flex-1" />

                <PlaceholderSelector onSelect={insertPlaceholder} />

                {mode === "visual" && (
                    <>
                        <div className="w-px h-4 bg-border/20 mx-1" />
                        <ToolbarButton
                            icon={Undo}
                            command="undo"
                            label="Undo"
                            showActive={false}
                        />
                        <ToolbarButton
                            icon={Redo}
                            command="redo"
                            label="Redo"
                            showActive={false}
                        />
                    </>
                )}
            </div>

            {/* Editor Area */}
            <div className="relative min-h-[300px] flex flex-col bg-white/40 dark:bg-slate-900/40">
                {mode === "visual" ? (
                    <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleInput}
                        onKeyUp={updateCommandState}
                        onMouseUp={updateCommandState}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => {
                            setIsFocused(false)
                            handleInput()
                        }}
                        onMouseDown={(e) => {
                            const target = e.target as HTMLElement;
                            if (target.tagName === 'IMG') {
                                // Prevent default drag-move behavior
                                e.preventDefault();

                                const img = target as HTMLImageElement;
                                setResizingImage({
                                    img,
                                    startX: e.clientX,
                                    startWidth: img.offsetWidth
                                });
                            }
                        }}
                        onDragStart={(e) => {
                            if ((e.target as HTMLElement).tagName === 'IMG') {
                                e.preventDefault();
                            }
                        }}
                        onKeyDown={(e) => {
                            // Support basic keyboard shortcuts for images when selected
                            if (e.key === 'Backspace' || e.key === 'Delete') {
                                handleInput()
                            }
                        }}
                        className={cn(
                            "flex-1 p-8 text-sm font-medium leading-relaxed outline-none focus:outline-none custom-scrollbar overflow-y-auto",
                            "max-w-none prose dark:prose-invert",
                            "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2",
                            "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2",
                            "[&_li]:my-1",
                            "[&_b]:font-bold [&_strong]:font-bold",
                            "[&_i]:italic [&_em]:italic",
                            "[&_u]:underline",
                            "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-secondary",
                            "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/20 [&_blockquote]:bg-primary/5 [&_blockquote]:p-4 [&_blockquote]:rounded-r-lg [&_blockquote]:my-6 [&_blockquote]:text-muted-foreground",
                            "[&_img]:cursor-nwse-resize [&_img]:my-6 active:[&_img]:ring-2 active:[&_img]:ring-primary/40",
                            "[&_img]:inline-block [&_img]:transition-shadow select-none"
                        )}
                    />
                ) : (
                    <Textarea
                        value={value}
                        onChange={(e) => onChange?.(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Write raw HTML code here..."
                        className="flex-1 p-8 text-xs font-mono border-none bg-transparent focus-visible:ring-0 leading-relaxed custom-scrollbar min-h-[300px] resize-none"
                    />
                )}

                {!value && !isFocused && mode === "visual" && (
                    <div className="absolute top-8 left-8 text-sm text-muted-foreground/30 pointer-events-none font-medium">
                        {placeholder}
                    </div>
                )}
            </div>
        </div>
    )
}

