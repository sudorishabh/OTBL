"use client";

import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Calendar = ({
  value,
  onChange,
}: {
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
}) => {
  const handleChange = (date: Date | undefined) => {
    onChange(date);
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
          )}>
          <CalendarIcon className='mr-2 h-4 w-4' />
          {value ? format(value, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-auto p-0'
        align='start'>
        <CalendarComponent
          mode='single'
          selected={value}
          onSelect={(value) => handleChange(value)}
          className='rounded-md border-0'
          captionLayout='dropdown'
        />
        <p
          className='text-muted-foreground pb-2 text-center text-xs'
          role='region'>
          Month and year dropdown calendar
        </p>
      </PopoverContent>
    </Popover>
  );
};

export default Calendar;
