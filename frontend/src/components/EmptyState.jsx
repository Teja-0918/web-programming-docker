function EmptyState({ title, message, actionLabel, onAction }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center text-slate-300">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm">{message}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export default EmptyState;
