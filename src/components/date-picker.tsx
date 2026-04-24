'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type DatePickerProps = {
  value: Date | undefined;
  onChange: (date: Date) => void;
  disabled?: (date: Date) => boolean;
  placeholder?: string;
  className?: string;
};

export function DatePicker({
  value,
  onChange,
  disabled,
  placeholder = '選擇日期',
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const formatted = value?.toLocaleDateString('sv-SE', {
    timeZone: 'Asia/Taipei',
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          className={cn(
            'w-full justify-start text-left font-normal bg-input/50',
            className,
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {formatted ?? (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          disabled={disabled}
          onSelect={(d) => {
            if (d) {
              onChange(d);
              setOpen(false);
            }
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
