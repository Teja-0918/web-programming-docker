function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-sky-400" />
      <span>{label}</span>
    </div>
  );
}

export default LoadingSpinner;
