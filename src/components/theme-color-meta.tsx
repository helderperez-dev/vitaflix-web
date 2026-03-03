"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

const LIGHT_COLOR = "#ffffff";
const DARK_COLOR = "#262d3d";

export function ThemeColorMeta() {
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        const color = resolvedTheme === "dark" ? DARK_COLOR : LIGHT_COLOR;
        let meta = document.querySelector<HTMLMetaElement>(
            'meta[name="theme-color"]'
        );
        if (!meta) {
            meta = document.createElement("meta");
            meta.name = "theme-color";
            document.head.appendChild(meta);
        }
        meta.content = color;
    }, [resolvedTheme]);

    return null;
}
