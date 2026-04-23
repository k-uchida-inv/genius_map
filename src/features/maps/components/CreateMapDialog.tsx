'use client';

import { cloneElement, isValidElement, useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { createMap } from '../actions/createMap';

type CreateMapDialogProps = {
  children: ReactNode;
};

export function CreateMapDialog({ children }: CreateMapDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }
    setTitleError('');

    startTransition(async () => {
      const result = await createMap({ title: title.trim(), description });
      if (!result.success) {
        toast.error('マップの作成に失敗しました');
        return;
      }
      setTitle('');
      setDescription('');
      setOpen(false);
      router.push(`/maps/${result.data.id}`);
    });
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isPending) return;
    setOpen(isOpen);
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setTitleError('');
    }
  };

  const trigger = isValidElement(children)
    ? cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
        onClick: () => setOpen(true),
      })
    : children;

  return (
    <>
      {trigger}
      <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Create New Map</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Input
              placeholder="Map title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (e.target.value.trim()) setTitleError('');
              }}
              maxLength={100}
              aria-invalid={!!titleError}
              disabled={isPending}
            />
            {titleError && (
              <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
                {titleError}
              </p>
            )}
          </div>
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={3}
            disabled={isPending}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isPending}
            style={{ backgroundColor: 'var(--color-brand)', color: '#ffffff' }}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>
    </>
  );
}
