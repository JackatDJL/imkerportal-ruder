"use client";

import * as React from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import {
  type DayButton,
  DayPicker,
  getDefaultClassNames,
} from "react-day-picker";

import { cn } from "~/lib/utils";
import { Button, buttonVariants } from "~/components/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  console.dir(defaultClassNames, {
    depth: Infinity,
  });

  return (
    <DayPicker
      timeZone="Europe/Berlin"
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar bg-background p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        ...formatters,
        formatMonthDropdown: (date: Date) =>
          date.toLocaleString("de-DE", { month: "short" }),
        formatWeekdayName: (date: Date) =>
          date.toLocaleString("de-DE", { weekday: "short" }),
        formatCaption: (date: Date) =>
          date.toLocaleString("de-DE", { month: "long", year: "numeric" }),
      }}
      classNames={{
        root: cn(defaultClassNames.root, "w-fit"),
        months: cn(
          defaultClassNames.months,
          "flex gap-4 flex-col md:flex-row relative",
        ),
        month: cn(defaultClassNames.month, "flex flex-col w-full gap-4"),
        nav: cn(
          defaultClassNames.nav,
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
        ),
        button_previous: cn(
          defaultClassNames.button_previous,
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
        ),
        button_next: cn(
          defaultClassNames.button_next,
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
        ),
        month_caption: cn(
          defaultClassNames.month_caption,
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
        ),
        dropdowns: cn(
          defaultClassNames.dropdowns,
          "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
        ),
        dropdown_root: cn(
          defaultClassNames.dropdown_root,
          "relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
        ),
        dropdown: cn(defaultClassNames.dropdown, "absolute inset-0 opacity-0"),
        caption_label: cn(
          defaultClassNames.caption_label,
          "select-none font-medium",
          captionLayout === "label"
            ? "text-sm"
            : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5",
        ),
        table: "w-full border-collapse",
        weekdays: cn(defaultClassNames.weekdays, "flex"),
        weekday: cn(
          defaultClassNames.weekday,
          "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none",
        ),
        week: cn(defaultClassNames.week, "flex w-full mt-2"),
        week_number_header: cn(
          defaultClassNames.week_number_header,
          "select-none w-(--cell-size)",
        ),
        week_number: cn(
          defaultClassNames.week_number,
          "text-[0.8rem] select-none text-muted-foreground",
        ),
        day: cn(
          defaultClassNames.day,
          "relative w-full h-full p-0 text-center rounded-lg [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none",
        ),
        range_start: cn(defaultClassNames.range_start, "rounded-l-md"),
        range_middle: cn(defaultClassNames.range_middle, "rounded-none"),
        range_end: cn(defaultClassNames.range_end, "rounded-r-md"),
        today: cn(
          defaultClassNames.today,
          "border-accent/20 border-2 rounded-lg data-[selected=true]:border-secondary/40 data-[selected=true]:bg-secondary/10 ",
        ),
        outside: cn(
          defaultClassNames.outside,
          "text-muted-foreground aria-selected:text-muted-foreground",
        ),
        disabled: cn(
          defaultClassNames.disabled,
          "text-muted-foreground opacity-50",
        ),
        hidden: cn(defaultClassNames.hidden, "invisible"),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          );
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            );
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            );
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          );
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring/40 group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground [&>span]:text-xs [&>span]:opacity-70",
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
