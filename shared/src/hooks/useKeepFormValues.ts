"use client";

import { startTransition, type FormEvent } from "react";

/**
 * React clears a `<form action={…}>` after every submit, so a form sent back with an error
 * ("Title is required") came back empty and everything had to be typed again.
 * Use as `onSubmit={keepFormValues(formAction)}` next to `action={formAction}`: the same server action
 * runs (pending state and redirects still work) but the typed values stay on screen.
 */
export function keepFormValues(dispatch: (fd: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    const fd = new FormData(e.currentTarget, submitter);
    startTransition(() => dispatch(fd));
  };
}
