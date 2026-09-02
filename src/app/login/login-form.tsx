"use client";

import { type FormEvent, useActionState, useState } from "react";

import { Button } from "@/components/button";
import { Toast } from "@/components/toast";

import { signInWithGoogle, type LoginState } from "./actions";
import { LoginErrorDialog } from "./login-error-dialog";
import { PrivacyPolicyDialog } from "./privacy-policy-dialog";

const initialState: LoginState = { error: null };

export function LoginForm({
  callbackUrl,
  authError,
}: {
  callbackUrl: string;
  authError: boolean;
}) {
  const [accepted, setAccepted] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [consentToastOpen, setConsentToastOpen] = useState(false);
  const [dismissedLoginError, setDismissedLoginError] = useState<string | null>(
    null,
  );
  const [state, formAction, pending] = useActionState(
    signInWithGoogle,
    initialState,
  );
  const loginError = authError ? "auth-error" : state.error;
  const loginErrorOpen =
    loginError !== null && loginError !== dismissedLoginError;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (accepted) return;
    event.preventDefault();
    setConsentToastOpen(true);
  };

  const closeLoginError = () => {
    setDismissedLoginError(loginError);

    const url = new URL(window.location.href);
    if (!url.searchParams.has("error")) return;
    url.searchParams.delete("error");
    window.history.replaceState(null, "", url);
  };

  return (
    <>
      <form
        action={formAction}
        onSubmit={handleSubmit}
        className="flex w-full flex-col items-center md:landscape:w-auto lg:w-auto"
      >
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        <Button
          type="submit"
          size="xl"
          disabled={pending}
          className="w-full md:landscape:w-auto md:landscape:min-w-44 lg:w-auto lg:min-w-44"
        >
          {pending ? "前往 Google…" : "Google 登入"}
        </Button>

        <div className="mt-6 flex items-center gap-3 text-body text-brand md:landscape:mt-8 lg:mt-8">
          <span className="relative size-6 shrink-0">
            <input
              id="login-consent"
              type="checkbox"
              name="consent"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              className="peer absolute inset-0 size-6 cursor-pointer appearance-none rounded-pill border border-line-strong bg-surface shadow-inner transition checked:border-brand checked:bg-brand focus-visible:outline-2 focus-visible:outline-brand"
            />
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="pointer-events-none absolute inset-0 size-6 text-inverse opacity-0 transition-opacity peer-checked:opacity-100"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6.5 12.5 3.5 3.5 7.5-8" />
            </svg>
          </span>
          <div className="flex items-center">
            <label htmlFor="login-consent" className="cursor-pointer">
              我同意
            </label>
            <button
              type="button"
              onClick={() => setPolicyOpen(true)}
              className="ml-2 cursor-pointer text-body-strong underline decoration-1 underline-offset-4 focus-visible:rounded-4 focus-visible:outline-2 focus-visible:outline-brand"
            >
              規範與隱私政策
            </button>
          </div>
        </div>
      </form>

      <Toast open={consentToastOpen} onClose={() => setConsentToastOpen(false)}>
        請同意規範與隱私政策
      </Toast>

      <PrivacyPolicyDialog
        open={policyOpen}
        onClose={() => setPolicyOpen(false)}
        onAccept={() => {
          setAccepted(true);
          setPolicyOpen(false);
        }}
      />

      <LoginErrorDialog open={loginErrorOpen} onClose={closeLoginError} />
    </>
  );
}
