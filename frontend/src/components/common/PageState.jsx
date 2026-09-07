import {
  AlertCircle,
  Inbox,
  RefreshCw,
} from "lucide-react";

export function LoadingState({
  message = "Loading...",
}) {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="text-center">
        <RefreshCw className="mx-auto h-7 w-7 animate-spin text-primary-600" />

        <p className="mt-3 text-sm font-medium text-slate-600">
          {message}
        </p>
      </div>
    </div>
  );
}

export function PageLoading({
  message = "Loading...",
}) {
  return (
    <LoadingState message={message} />
  );
}

export function ErrorState({
  message = "Something went wrong.",
  onRetry,
}) {
  return (
    <div className="flex min-h-[300px] items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
          <AlertCircle className="h-6 w-6 text-red-500" />
        </div>

        <h3 className="mt-4 text-sm font-semibold text-slate-900">
          Unable to load data
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {message}
        </p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

export function PageError({
  message = "Something went wrong.",
  onRetry,
}) {
  return (
    <ErrorState
      message={message}
      onRetry={onRetry}
    />
  );
}

export function EmptyState({
  title = "No data found",
  message = "There is nothing to display yet.",
  action,
}) {
  return (
    <div className="flex min-h-[300px] items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
          <Inbox className="h-6 w-6 text-slate-400" />
        </div>

        <h3 className="mt-4 text-sm font-semibold text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {message}
        </p>

        {action && (
          <div className="mt-4">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

export function PageEmpty({
  title = "No data found",
  message = "There is nothing to display yet.",
  action,
}) {
  return (
    <EmptyState
      title={title}
      message={message}
      action={action}
    />
  );
}