'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Copy, Trash2 } from 'lucide-react';
import { deleteMap } from '../actions/deleteMap';
import { duplicateMap } from '../actions/duplicateMap';

type MapCardMenuProps = {
  mapId: string;
};

export function MapCardMenu({ mapId }: MapCardMenuProps) {
  const [isPending, startTransition] = useTransition();

  const handleDuplicate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await duplicateMap({ id: mapId });
      if (result.success) {
        toast.success('マップを複製しました');
      } else {
        toast.error('複製に失敗しました');
      }
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('このマップを削除しますか？この操作は取り消せません。')) return;
    startTransition(async () => {
      const result = await deleteMap({ id: mapId });
      if (result.success) {
        toast.success('マップを削除しました');
      } else {
        toast.error('削除に失敗しました');
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex shrink-0 items-center justify-center size-7 rounded-[min(var(--radius-md),12px)] transition-all hover:bg-muted hover:text-foreground outline-none"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        aria-label="Map menu"
        disabled={isPending}
      >
        <MoreHorizontal className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDuplicate} className="cursor-pointer">
          <Copy />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} variant="destructive" className="cursor-pointer">
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
