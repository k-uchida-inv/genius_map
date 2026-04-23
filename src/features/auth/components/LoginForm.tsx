'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { login } from '../actions/login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email) { setErrors({ email: 'メールアドレスは必須です' }); return; }
    if (!password) { setErrors({ password: 'パスワードは必須です' }); return; }

    startTransition(async () => {
      const result = await login({ email, password });
      if (!result.success) {
        toast.error(result.error.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          name="email"
          type="email"
          placeholder="メールアドレス"
          disabled={isPending}
        />
        {errors.email && (
          <p className="text-sm mt-1" style={{ color: 'var(--color-danger)' }}>{errors.email}</p>
        )}
      </div>
      <div>
        <Input
          name="password"
          type="password"
          placeholder="パスワード"
          disabled={isPending}
        />
        {errors.password && (
          <p className="text-sm mt-1" style={{ color: 'var(--color-danger)' }}>{errors.password}</p>
        )}
      </div>
      <Button
        type="submit"
        disabled={isPending}
        className="w-full"
        style={{ backgroundColor: 'var(--color-brand)', color: '#ffffff' }}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'ログイン'}
      </Button>
    </form>
  );
}
