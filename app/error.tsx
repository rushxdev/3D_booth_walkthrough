"use client";

import { Button } from "./../app/components/ui/Button";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="flex h-full items-center justify-center bg-surface-0 p-6">
      <div className="max-w-sm space-y-3 rounded-sm border border-line bg-surface-1 p-4 text-sm">
        <p className="font-medium text-fg">Something went wrong</p>
        <p className="text-fg-secondary">Your saved setup is kept in this browser. Try again, or reload the page.</p>
        <div className="flex justify-end">
          <Button variant="primary" onClick={reset}>
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}