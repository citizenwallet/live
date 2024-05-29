"use client";

import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MouseEvent, MouseEventHandler, useRef, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { ReloadIcon } from "@radix-ui/react-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export interface DatePickerProps {
  className?: string;
  value?: Date;
  disabled?: boolean;
  onChange: (value?: Date) => void;
}

export function DatePicker({
  className,
  value,
  disabled = false,
  onChange,
}: DatePickerProps) {
  const initialDateRef = useRef(value);

  const [open, setOpen] = useState(false);
  const [selectValue, setSelectValue] = useState<string | undefined>();

  const openPopover = () => {
    if (disabled) {
      return;
    }

    setOpen(true);
  };

  const closePopover = () => {
    if (disabled) {
      return;
    }

    setOpen(false);
  };

  const onClear: MouseEventHandler = (e: MouseEvent) => {
    if (disabled) {
      return;
    }

    e.preventDefault();
    closePopover();
    onDateChange(undefined);
  };

  const onDatePresetSelect = (option: string) => {
    if (disabled) {
      return;
    }

    let date: Date;
    switch (option) {
      case "0":
        // 1 hour ago
        date = new Date(Date.now() - 3600 * 1000);
        break;
      case "1":
        // 6 hours ago
        date = new Date(Date.now() - 3 * 3600 * 1000);
        break;
      case "2":
        // 6 hours ago
        date = new Date(Date.now() - 6 * 3600 * 1000);
        break;
      case "3":
        // Today
        date = new Date();
        date.setHours(0, 0, 0, 0);
        break;
      case "4":
        // Yesterday
        date = new Date(Date.now() - 24 * 3600 * 1000);
        date.setHours(0, 0, 0, 0);
        break;
      case "5":
        // 7 days ago
        date = new Date(Date.now() - 7 * 24 * 3600 * 1000);
        date.setHours(0, 0, 0, 0);
      default:
        date = new Date();
        break;
    }

    setSelectValue(option);
    closePopover();
    onChange(date);
  };

  const onDateChange = (date: Date | undefined) => {
    if (disabled) {
      return;
    }

    setSelectValue(undefined);
    closePopover();
    onChange(date);
  };

  const isSame = value?.toISOString() === initialDateRef.current?.toISOString();

  return (
    <Popover open={open}>
      <PopoverTrigger asChild>
        <div className="flex flex-row justify-center items-center">
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !value && "text-muted-foreground",
              className
            )}
            onClick={openPopover}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="flex-1">
              {value ? format(value, "PPP p") : "Pick a date"}
            </span>
            {value && !isSame && !open && (
              <ReloadIcon onClick={onClear} className="ml-2 h-4 w-4" />
            )}
          </Button>
          {/* {value && (
            <Button
              variant={"ghost"}
              className="w-[24px] h-[24px] p-0 "
              onClick={onClear}
            >
              <ReloadIcon className="p-1" />
            </Button>
          )} */}
        </div>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
        <Select onValueChange={onDatePresetSelect} value={selectValue}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="0">1 hour ago</SelectItem>
            <SelectItem value="1">3 hours ago</SelectItem>
            <SelectItem value="2">6 hours ago</SelectItem>
            <SelectItem value="3">Today</SelectItem>
            <SelectItem value="4">Yesterday</SelectItem>
            <SelectItem value="5">7 days ago</SelectItem>
          </SelectContent>
        </Select>
        <div className="rounded-md border">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onDateChange}
            initialFocus
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
