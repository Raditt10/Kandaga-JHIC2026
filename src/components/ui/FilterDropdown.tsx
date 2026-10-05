"use client"

import React, { useState, useRef, useEffect } from "react"
import { Filter, ChevronDown, Check } from "lucide-react"

export interface FilterOption<T extends string = string> {
  value: T
  label: string
  count?: number | string
  icon?: React.ComponentType<{ className?: string }>
}

export interface FilterDropdownProps<T extends string = string> {
  value: T
  onChange: (value: T) => void
  options: FilterOption<T>[]
  label?: string
  placeholder?: string
  className?: string
  align?: "left" | "right"
  disabled?: boolean
}

export function FilterDropdown<T extends string = string>({
  value,
  onChange,
  options,
  label,
  placeholder = "Pilih filter",
  className = "",
  align = "right",
  disabled = false,
}: FilterDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`group inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition cursor-pointer select-none shadow-2xs ${
          isOpen
            ? "border-primary ring-2 ring-primary/20 bg-primary/5 text-primary"
            : "border-ink-150 bg-white text-ink-700 hover:border-primary/50 hover:text-ink-900"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <Filter
          className={`w-3.5 h-3.5 shrink-0 transition-colors ${
            isOpen ? "text-primary" : "text-ink-400 group-hover:text-primary"
          }`}
          aria-hidden="true"
        />

        <div className="flex items-center gap-1.5 truncate">
          {label && <span className="text-ink-400 text-xs font-medium">{label}:</span>}
          <span className="truncate text-ink-800">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption && selectedOption.count !== undefined && (
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded-full transition-colors ${
                isOpen
                  ? "bg-primary text-white"
                  : "bg-ink-100 text-ink-600 group-hover:bg-primary/10 group-hover:text-primary"
              }`}
            >
              ({selectedOption.count})
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-ink-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : "group-hover:text-ink-600"
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute ${
            align === "left" ? "left-0" : "right-0"
          } mt-1.5 z-40 min-w-[200px] max-w-xs rounded-2xl border border-ink-150 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150`}
        >
          <div className="space-y-0.5 max-h-60 overflow-y-auto">
            {options.map((opt) => {
              const isSelected = opt.value === value
              const Icon = opt.icon

              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer select-none text-left ${
                    isSelected
                      ? "bg-primary text-white shadow-xs"
                      : "text-ink-700 hover:bg-ink-100/70 hover:text-ink-900"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {Icon && (
                      <Icon
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected ? "text-white" : "text-ink-400"
                        }`}
                      />
                    )}
                    <span className="truncate">{opt.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {opt.count !== undefined && (
                      <span
                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-ink-100 text-ink-600"
                        }`}
                      >
                        {opt.count}
                      </span>
                    )}
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-white" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
export default FilterDropdown
