"use client";

import { useActionState, useState } from "react";

import { AlertCircle, Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { login, type LoginState } from "../actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} noValidate>
      <FieldGroup>
        {state.message ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        ) : null}

        <Field data-invalid={Boolean(state.errors?.email)}>
          <FieldLabel htmlFor="email">Email address</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="admin@example.com"
            aria-invalid={Boolean(state.errors?.email)}
            disabled={pending}
          />
          <FieldError>{state.errors?.email}</FieldError>
        </Field>

        <Field data-invalid={Boolean(state.errors?.password)}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="pr-9"
              aria-invalid={Boolean(state.errors?.password)}
              disabled={pending}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              disabled={pending}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </Button>
          </div>
          <FieldError>{state.errors?.password}</FieldError>
        </Field>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? <LoaderCircle className="animate-spin" /> : <LockKeyhole />}
          {pending ? "Signing in..." : "Sign in to administration"}
        </Button>
      </FieldGroup>
    </form>
  );
}
