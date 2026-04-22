'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Copy, Trash2 } from 'lucide-react';

type MapCardMenuProps = {
  mapId: string;
};

export function MapCardMenu({ mapId }: MapCardMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex shrink-0 items-center justify-center size-7 rounded-[min(var(--radius-md),12px)] transition-all hover:bg-muted hover:text-foreground outline-none"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        aria-label="Map menu"
      >
        <MoreHorizontal className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('duplicate', mapId);
            alert('Map duplicated');
          }}
          className="cursor-pointer"
        >
          <Copy />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('delete', mapId);
            alert('Confirm delete');
          }}
          variant="destructive"
          className="cursor-pointer"
        >
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
