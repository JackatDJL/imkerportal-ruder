"use client";

import * as React from "react";
import { Calendar, CalendarDayButton } from "~/components/ui/calendar";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
export interface CalendarTodayProps {
  id?: string;
  // Card presentation props
  cardTitle?: React.ReactNode;
  cardDescription?: React.ReactNode;
  showTodayButton?: boolean;
  todayButtonLabel?: React.ReactNode;

  // Calendar state and behavior props
  className?: string;
  selected?: Date;
  onSelect?: (
    date: Date,
    selectedDay: Date | undefined,
    modifiers: Record<string, boolean> | undefined,
  ) => void;
  month?: Date;
  onMonthChange?: (month: Date) => void;

  // Calendar display props
  disabled?: boolean | Date | ((date: Date) => boolean);
  fromDate?: Date;
  toDate?: Date;
  showOutsideDays?: boolean;
  fckTheCard?: boolean; // Removes the Card "Border" wrapper
}

export function CalendarToday({
  id,
  cardTitle = "Kalender",
  cardDescription = "Datum auswählen",
  showTodayButton = true,
  todayButtonLabel = "Heute",
  fckTheCard = false,
  ...props
}: CalendarTodayProps) {
  const [date, setDate] = React.useState<Date | undefined>(props.selected);
  const [month, setMonth] = React.useState<Date>(
    props.month instanceof Date ? props.month : new Date(),
  );

  React.useEffect(() => {
    setDate(props.selected);
  }, [props.selected]);

  React.useEffect(() => {
    if (props.month instanceof Date) {
      setMonth(props.month);
    }
  }, [props.month]);

  const handleToday = () => {
    const today = new Date();
    setMonth(today);
    setDate(today);
    props.onSelect?.(today, today, { selected: true });
    props.onMonthChange?.(today);
  };

  return (
    <Card id={id} className={fckTheCard ? "border-none" : undefined}>
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
        {showTodayButton && (
          <CardAction>
            <Button size="sm" variant="outline" onClick={handleToday}>
              {todayButtonLabel}
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <Calendar
          {...props}
          mode="single"
          month={month}
          onMonthChange={(newMonth: Date) => {
            setMonth(newMonth);
            props.onMonthChange?.(newMonth);
          }}
          selected={date}
          onSelect={(
            newDate: Date | undefined,
            selectedDay: Date | undefined,
            modifiers: Record<string, boolean> | undefined,
          ) => {
            setDate(newDate);
            if (newDate) {
              props.onSelect?.(newDate, selectedDay, modifiers);
            }
          }}
          className={
            props.className
              ? `bg-transparent p-0 ${props.className}`
              : "bg-transparent p-0"
          }
        />
      </CardContent>
    </Card>
  );
}

// Optionally export CalendarDayButton for custom day rendering
export { CalendarDayButton };
