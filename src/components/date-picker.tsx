"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { CalendarToday } from "~/components/calendar-today";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import type { DateRange } from "react-day-picker";

type DatePickerBaseProps = {
  id?: string;
  value?: Date | Date[] | DateRange;
  onChange?: (date: Date | Date[] | DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean | Date | ((date: Date) => boolean);
  fromDate?: Date;
  toDate?: Date;
  cardTitle?: React.ReactNode;
  cardDescription?: React.ReactNode;
  className?: string;
  popoverClassName?: string;
  calendarProps?: Omit<
    React.ComponentProps<typeof Calendar>,
    "selected" | "onSelect" | "mode"
  >;
  calendarTodayProps?: Omit<
    React.ComponentProps<typeof CalendarToday>,
    "selected" | "onSelect" | "mode"
  >;
};

type DatePickerSingleModeProps = DatePickerBaseProps & {
  mode: "single";
  showTodayButton?: boolean;
  todayButtonLabel?: React.ReactNode;
};

type DatePickerOtherModesProps = DatePickerBaseProps & {
  mode: "multiple" | "range";
  showTodayButton?: never;
  todayButtonLabel?: never;
};

export type DatePickerProps =
  | DatePickerSingleModeProps
  | DatePickerOtherModesProps;

export function DatePicker({
  id,
  value,
  onChange,
  mode = "single",
  placeholder = "Pick a date",
  disabled,
  fromDate,
  toDate,
  showTodayButton,
  todayButtonLabel,
  cardTitle,
  cardDescription,
  className,
  popoverClassName,
  calendarProps,
  calendarTodayProps,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | Date[] | DateRange | undefined>(
    value,
  );

  React.useEffect(() => {
    setDate(value);
  }, [value]);

  const handleSelect = (selected: Date | Date[] | DateRange | undefined) => {
    console.log("Selected date:", JSON.stringify(selected));
    setDate(selected);
    onChange?.(selected);
    setOpen(false);
  };

  let displayValue: string = placeholder;
  if (date) {
    if (mode === "single" && date instanceof Date) {
      displayValue = date.toLocaleString("de-DE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } else if (mode === "multiple" && Array.isArray(date)) {
      displayValue =
        date.length > 0
          ? date
              .map((d) =>
                d.toLocaleString("de-DE", { month: "long", year: "numeric" }),
              )
              .join(", ")
          : placeholder;
    } else if (
      mode === "range" &&
      typeof date === "object" &&
      "from" in date &&
      date.from
    ) {
      if (date.to) {
        displayValue = `${date.from.toLocaleString("de-DE", { month: "long", year: "numeric" })} – ${date.to.toLocaleString("de-DE", { month: "long", year: "numeric" })}`;
      } else {
        displayValue = date.from.toLocaleString("de-DE", {
          month: "long",
          year: "numeric",
        });
      }
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          data-empty={
            !date ||
            (mode === "multiple" && Array.isArray(date) && date.length === 0)
          }
          className={cn(
            "w-[280px] justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-auto p-0", popoverClassName)}
        align="start"
      >
        {mode === "single" && showTodayButton ? (
          <CalendarToday
            selected={date as Date | undefined}
            onSelect={(
              d: Date | Date[] | DateRange | undefined,
              _selectedDay: Date | undefined,
              _modifiers: Record<string, boolean> | undefined,
            ) => handleSelect(d)}
            disabled={disabled}
            fromDate={fromDate}
            toDate={toDate}
            todayButtonLabel={todayButtonLabel}
            cardTitle={cardTitle}
            cardDescription={cardDescription}
            {...calendarTodayProps}
          />
        ) : mode === "range" ? (
          <Calendar
            mode="range"
            required
            selected={
              typeof date === "object" && date && "from" in date
                ? date
                : undefined
            }
            onSelect={(
              d: DateRange | undefined,
              _selectedDay: Date | undefined,
              _modifiers: Record<string, boolean> | undefined,
            ) => handleSelect(d)}
            disabled={disabled}
            fromDate={fromDate}
            toDate={toDate}
            {...calendarProps}
          />
        ) : mode === "multiple" ? (
          <Calendar
            mode="multiple"
            selected={Array.isArray(date) ? date : []}
            onSelect={(
              d: Date[] | undefined,
              _selectedDay: Date | undefined,
              _modifiers: Record<string, boolean> | undefined,
            ) => handleSelect(d)}
            disabled={disabled}
            fromDate={fromDate}
            toDate={toDate}
            {...calendarProps}
          />
        ) : (
          <Calendar
            mode="single"
            selected={date instanceof Date ? date : undefined}
            onSelect={(
              d: Date | undefined,
              _selectedDay: Date | undefined,
              _modifiers: Record<string, boolean> | undefined,
            ) => handleSelect(d)}
            disabled={disabled}
            fromDate={fromDate}
            toDate={toDate}
            {...calendarProps}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
