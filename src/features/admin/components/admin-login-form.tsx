"use client";

import { useActionState } from "react";

import { loginAdminAction } from "@/features/admin/actions";

export function AdminLoginForm({ from }: { from: string }) {
  const [state, formAction, pending] = useActionState(loginAdminAction, null);

  return (
    <form className="topic-form" action={formAction} data-testid="admin-login">
      <input type="hidden" name="from" value={from} />

      {state?.error ? (
        <p className="topic-form__error" role="alert">
          {state.error}
        </p>
      ) : null}

      <label className="topic-form__field">
        <span>Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </label>

      <button className="topic-form__submit" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
