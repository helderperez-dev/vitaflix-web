"use client"

import * as React from "react"
import {
    Bold, Italic, List, ListOrdered, Undo, Redo,
    Underline as UnderlineIcon, Heading3, Quote,
    Highlighter, Image as ImageIcon, Link as LinkIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface RichTextProps {
    value?: string
    onChange?: (value: string) => void
    placeholder?: string
    className?: string
}

export function RichText({ value, onChange, placeholder, className }: RichTextProps) {
    const editorRef = React.useRef<HTMLDivElement>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const [isFocused, setIsFocused] = React.useState(false)
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
            setCommandState({
                bold: document.queryCommandState("bold"),
                italic: document.queryCommandState("italic"),
                underline: document.queryCommandState("underline"),
                insertUnorderedList: document.queryCommandState("insertUnorderedList"),
                insertOrderedList: document.queryCommandState("insertOrderedList"),
                isHeading: document.queryCommandValue("formatBlock") === "h3",
                isQuote: document.queryCommandValue("formatBlock") === "blockquote"
            })
        }
    }, [])

    React.useEffect(() => {
        if (editorRef.current && !isFocused && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value || ""
        }
    }, [value, isFocused])

    const handleInput = () => {
        if (editorRef.current) {
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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                const base64 = event.target?.result as string
                execCommand("insertImage", base64)
                if (fileInputRef.current) fileInputRef.current.value = ""
            }
            reader.readAsDataURL(file)
        }
    }

    const ToolbarButton = ({
        icon: Icon,
        command,
        commandValue,
        active = false,
        label,
        showActive = true
    }: {
        icon: any,
        command: string,
        commandValue?: string,
        active?: boolean,
        label: string,
        showActive?: boolean
    }) => (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onMouseDown={(e) => {
                e.preventDefault()
                execCommand(command, commandValue)
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

    return (
        <div className={cn(
            "flex flex-col rounded-xl border border-border/40 bg-muted/5 transition-all duration-300 overflow-hidden",
            isFocused && "ring-4 ring-primary/5 border-primary/20 bg-background shadow-md",
            className
        )}>
            {/* Toolbar */}
            <div className="flex items-center flex-wrap gap-1 p-2 border-b border-border/10 bg-muted/10 backdrop-blur-sm">
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
                    label="Quote / Tip"
                />
                <ToolbarButton
                    icon={Highlighter}
                    command="backColor"
                    commandValue="yellow"
                    label="Highlight Action"
                    showActive={false}
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
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 w-8 rounded-lg text-muted-foreground/60 hover:text-primary hover:bg-primary/5 active:scale-90"
                    title="Add Photo"
                >
                    <ImageIcon className="h-4 w-4" />
                </Button>

                <div className="flex-1" />

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
            </div>

            {/* Editor Area */}
            <div className="relative min-h-[200px] flex flex-col bg-white/40 dark:bg-slate-900/40">
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
                    className={cn(
                        "flex-1 p-5 text-sm font-medium leading-relaxed outline-none focus:outline-none custom-scrollbar overflow-y-auto",
                        "max-w-none prose dark:prose-invert",
                        // Manual styling for the editor content
                        "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2",
                        "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2",
                        "[&_li]:my-1",
                        "[&_b]:font-bold [&_strong]:font-bold",
                        "[&_i]:italic [&_em]:italic",
                        "[&_u]:underline",
                        "[&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-primary",
                        "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-muted-foreground",
                        "[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:my-4 [&_img]:border [&_img]:border-border/40"
                    )}
                />
                {!value && !isFocused && (
                    <div className="absolute top-5 left-5 text-sm text-muted-foreground/30 pointer-events-none font-medium italic">
                        {placeholder}
                    </div>
                )}
            </div>
        </div>
    )
}
