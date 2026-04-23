'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { signup } from '../actions/signup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail } from 'lucide-react';

export function SignupForm() {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email) { setErrors({ email: 'メールアドレスは必須です' }); return; }
    if (password.length < 8) { setErrors({ password: 'パスワードは8文字以上で入力してください' }); return; }

    startTransition(async () => {
      const result = await signup({ email, password });
      if (!result.success) {
        toast.error(result.error.message);
        return;
      }
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="text-center space-y-3 py-4">
        <Mail className="h-10 w-10 mx-auto" style={{ color: 'var(--color-brand)' }} />
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          確認メールを送信しました。メールのリンクをクリックしてください。
        </p>
      </div>
    );
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
          placeholder="パスワード（8文字以上）"
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
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'アカウントを作成'}
      </Button>
    </form>
  );
}
