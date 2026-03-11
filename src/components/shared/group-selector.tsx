"use client"

import * as React from "react"
import { TagSelector } from "@/components/shared/tag-selector"
import { useTranslations } from "next-intl"

interface GroupSelectorProps {
    selectedGroupIds: string[]
    onGroupsChange: (groupIds: string[]) => void
}

export function GroupSelector({ selectedGroupIds, onGroupsChange }: GroupSelectorProps) {
    const t = useTranslations("Products")

    return (
        <TagSelector
            title={t("group")}
            table="product_groups"
            selectedTagIds={selectedGroupIds}
            onTagsChange={onGroupsChange}
        />
    )
}
