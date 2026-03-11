"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

const LIGHT_COLOR = "#ffffff";
// Matches oklch(0.18 0.03 240) — the dark --background token in globals.css
const DARK_COLOR = "#171f2e";

export function ThemeColorMeta() {
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        if (!resolvedTheme) return;

        const color = resolvedTheme === "dark" ? DARK_COLOR : LIGHT_COLOR;

        // Remove ALL existing theme-color meta tags (including Next.js media-query ones).
        // We can't rely on media-query-based tags because the browser uses the OS preference,
        // not the app's selected theme. A single plain tag without a media query overrides everything.
        document
            .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
            .forEach((m) => m.remove());

        // Insert one authoritative tag with the actual active color.
        const meta = document.createElement("meta");
        meta.name = "theme-color";
        meta.content = color;
        document.head.appendChild(meta);
    }, [resolvedTheme]);

    return null;
}
