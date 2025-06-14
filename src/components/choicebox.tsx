"use client";

import { useState } from "react";
import { cn } from "~/lib/utils";

export interface ChoiceboxOption<T = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface ChoiceboxProps<T> {
  options: ChoiceboxOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: ((value: T) => void) | React.Dispatch<React.SetStateAction<T>>;
  name?: string;
  className?: string;
  optionClassName?: string;
  selectedClassName?: string;
  disabledClassName?: string;
  direction?: "row" | "column";
  size?: "sm" | "md" | "lg";
  variant?: "default" | "card" | "minimal";
}

export default function Choicebox<T>({
  options,
  value,
  defaultValue,
  onChange,
  name,
  className,
  optionClassName,
  selectedClassName,
  disabledClassName,
  direction = "column",
  size = "md",
  variant = "default",
}: ChoiceboxProps<T>) {
  const [internalValue, setInternalValue] = useState<T | undefined>(
    defaultValue ?? options[0]?.value,
  );

  const currentValue = value ?? internalValue;

  const handleChange = (optionValue: T) => {
    if (value === undefined) {
      setInternalValue(optionValue as T | undefined);
    }
    onChange?.(optionValue);
  };

  const baseClasses = cn(
    "flex gap-2",
    direction === "row" ? "flex-row flex-wrap" : "flex-col",
    className,
  );

  const getOptionClasses = (
    option: ChoiceboxOption<T>,
    isSelected: boolean,
  ) => {
    const sizeClasses = {
      sm: "p-2 text-sm",
      md: "p-3 text-base",
      lg: "p-4 text-lg",
    };

    const variantClasses = {
      default: cn(
        "border rounded-lg cursor-pointer transition-all duration-200",
        "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
        isSelected
          ? "border-primary bg-primary/5 text-primary"
          : "border-border bg-background hover:bg-muted/50",
      ),
      card: cn(
        "border rounded-xl cursor-pointer transition-all duration-200 shadow-sm",
        "hover:shadow-md hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
        isSelected
          ? "border-primary bg-primary/5 text-primary shadow-md"
          : "border-border bg-card hover:bg-muted/30",
      ),
      minimal: cn(
        "rounded-md cursor-pointer transition-all duration-200",
        "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
        isSelected
          ? "bg-primary text-primary-foreground"
          : "bg-transparent hover:bg-muted/50",
      ),
    };

    return cn(
      sizeClasses[size],
      variantClasses[variant],
      option.disabled &&
        cn(
          "opacity-50 cursor-not-allowed hover:border-border hover:bg-background hover:shadow-none",
          disabledClassName,
        ),
      isSelected && selectedClassName,
      optionClassName,
    );
  };

  return (
    <div className={baseClasses} role="radiogroup">
      {options.map((option) => {
        const isSelected = currentValue === option.value;

        return (
          <label
            key={String(option.value)}
            className={getOptionClasses(option, isSelected)}
            tabIndex={option.disabled ? -1 : 0}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !option.disabled) {
                e.preventDefault();
                handleChange(option.value);
              }
            }}
          >
            <input
              type="radio"
              id={String(option.value)}
              name={name}
              value={String(option.value)}
              checked={isSelected}
              onChange={() => !option.disabled && handleChange(option.value)}
              disabled={option.disabled}
              className="sr-only"
            />
            <div className="flex w-full items-center justify-between">
              <div className="flex-1">
                <div className="font-medium">{option.label}</div>
                {option.description && (
                  <div
                    className={cn(
                      "mt-1 text-sm",
                      isSelected ? "text-primary/70" : "text-muted-foreground",
                    )}
                  >
                    {option.description}
                  </div>
                )}
              </div>
              <div
                className={cn(
                  "ml-3 flex h-4 w-4 items-center justify-center rounded-full border-2",
                  isSelected
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/30",
                )}
              >
                {isSelected && (
                  <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                )}
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}
