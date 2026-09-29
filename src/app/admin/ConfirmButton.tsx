"use client";

import type { ReactNode } from "react";

export function ConfirmButton({
  children,
  message,
  className = "",
  name,
  value,
}: {
  children: ReactNode;
  message: string;
  className?: string;
  name?: string;
  value?: string;
}) {
  return (
    <button
      type="submit"
      name={name}
      value={value}
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
