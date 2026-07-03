"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  value?: string
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({
  value = "",
  onChange,
  onSubmit,
  placeholder = "Rechercher une loi, un amendement, un député...",
  className,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = React.useState(value)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value)
    onChange?.(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSubmit?.(internalValue)
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border bg-background px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-primary",
        className
      )}
    >
      <Search className="h-4 w-4 text-muted-foreground" />

      <input
        value={internalValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="
          w-full bg-transparent text-sm outline-none
          placeholder:text-muted-foreground
        "
      />

      {/* hint keyboard UX */}
      <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
        <kbd className="rounded border px-1">⌘</kbd>
        <kbd className="rounded border px-1">K</kbd>
      </div>
    </div>
  )
}