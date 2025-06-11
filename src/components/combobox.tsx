"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"

export interface ComboBoxOption<T = string> {
  value: T
  label: string
  description?: string
  disabled?: boolean
}

export interface ComboBoxProps<T = string> {
  options: ComboBoxOption<T>[]
  placeholder?: string
  emptyText?: string
  value?: T
  defaultValue?: T
  onChange?: ((value: T) => void) | React.Dispatch<React.SetStateAction<T>>
  className?: string
  buttonClassName?: string
  contentClassName?: string
}

export function ComboBox<T extends string | number = string>({
  options,
  placeholder = "Select option...",
  emptyText = "No option found.",
  value,
  defaultValue,
  onChange,
  className,
  buttonClassName,
  contentClassName,
}: ComboBoxProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState<T | undefined>(defaultValue ?? options[0]?.value)
  const selectedValue = value ?? internalValue

  const handleSelect = (currentValue: T) => {
    if (value === undefined) {
      setInternalValue(currentValue)
    }
    if (typeof onChange === "function") {
      // Try to call as (value: T) => void, fallback to React.Dispatch<React.SetStateAction<T>>
      try {
        (onChange as (value: T) => void)(currentValue)
      } catch {
        (onChange as React.Dispatch<React.SetStateAction<T>>)(currentValue)
      }
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className={cn("w-full", className)}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] justify-between", buttonClassName)}
        >
          {selectedValue !== undefined && selectedValue !== null
            ? options.find((option) => option.value === selectedValue)?.label
            : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-[200px] p-0", contentClassName)}>
        <Command>
          <CommandInput placeholder={"Search..."} className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={String(option.value)}
                  value={String(option.value)}
                  onSelect={() => !option.disabled && handleSelect(option.value)}
                  disabled={option.disabled}
                  className={option.disabled ? "opacity-50 cursor-not-allowed" : undefined}
                >
                  <div className="flex flex-col w-full">
                    <span>{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    )}
                  </div>
                  <Check
                    className={cn(
                      "ml-auto",
                      selectedValue === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
