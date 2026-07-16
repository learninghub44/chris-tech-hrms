import { AlertCircle, Inbox, Loader2 } from "lucide-react";

type QueryStateProps = {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  loadingLabel: string;
  errorLabel: string;
  emptyLabel: string;
};

export function QueryState({
  isLoading,
  isError,
  isEmpty,
  loadingLabel,
  errorLabel,
  emptyLabel
}: QueryStateProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-edge bg-canvas px-4 py-10 text-center text-sm text-ink2-soft">
        <Loader2 size={20} className="animate-spin text-primary" aria-hidden="true" />
        {loadingLabel}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-danger/20 bg-danger/5 px-4 py-4 text-sm text-danger">
        <AlertCircle size={16} className="shrink-0" aria-hidden="true" />
        {errorLabel}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-edge bg-canvas px-4 py-10 text-center text-sm text-ink2-soft">
        <Inbox size={20} className="text-ink2-soft/70" aria-hidden="true" />
        {emptyLabel}
      </div>
    );
  }

  return null;
}
