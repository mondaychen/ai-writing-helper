'use client';

import { ChevronDown } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { InputBase, InputBaseAdornment, InputBaseControl } from '@/lib/components/ui/input-base';

function NativeSelect({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <InputBase
      data-slot="native-select"
      className={cn(
        'relative min-h-fit p-0 [&>select]:min-h-9 [&>select]:min-w-40 [&>select]:px-3 [&>select]:py-1',
        className,
      )}
      style={{
        boxShadow: 'none',
      }}>
      <InputBaseControl>
        <select className="size-full flex-1 appearance-none bg-transparent text-sm focus:outline-none" {...props} />
      </InputBaseControl>
      <InputBaseAdornment className="absolute right-0 top-1/2 -translate-y-1/2 pr-3">
        <ChevronDown />
      </InputBaseAdornment>
    </InputBase>
  );
}

function NativeSelectGroup({ className, ...props }: React.ComponentProps<'optgroup'>) {
  return (
    <optgroup
      data-slot="native-select-group"
      className={cn('bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50', className)}
      {...props}
    />
  );
}

function NativeSelectOption({ className, ...props }: React.ComponentProps<'option'>) {
  return (
    <option
      data-slot="native-select-option"
      className={cn('bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50', className)}
      {...props}
    />
  );
}

function NativeSelectPlaceholder({
  value = '',
  hidden = true,
  disabled = true,
  ...props
}: React.ComponentProps<'option'>) {
  return (
    <NativeSelectOption
      data-slot="native-select-placeholder"
      hidden={hidden}
      value={value}
      disabled={disabled}
      {...props}
    />
  );
}

export { NativeSelect, NativeSelectGroup, NativeSelectOption, NativeSelectPlaceholder };
