'use client';

import { cloneElement, isValidElement, useState, type ReactNode } from 'react';
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

type CreateMapDialogProps = {
  children: ReactNode;
};

export function CreateMapDialog({ children }: CreateMapDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');

  const handleCreate = () => {
    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }
    setTitleError('');
    console.log('create map', { title: title.trim(), description });
    alert('Map created');
    setTitle('');
    setDescription('');
    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setTitleError('');
    }
  };

  // Inject onClick to open dialog
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
                if (e.target.value.trim()) {
                  setTitleError('');
                }
              }}
              maxLength={100}
              aria-invalid={!!titleError}
            />
            {titleError && (
              <p
                className="text-sm"
                style={{ color: 'var(--color-danger)' }}
              >
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
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            style={{
              backgroundColor: 'var(--color-brand)',
              color: '#ffffff',
            }}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>
    </>
  );
}
