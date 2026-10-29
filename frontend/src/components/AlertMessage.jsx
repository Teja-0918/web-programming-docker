function AlertMessage({ type = 'info', title, message }) {
  const styles = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    error: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
    info: 'border-sky-500/30 bg-sky-500/10 text-sky-200',
  };

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles[type] || styles.info}`}>
      {title ? <p className="font-semibold">{title}</p> : null}
      {message ? <p className="mt-1">{message}</p> : null}
    </div>
  );
}

export default AlertMessage;
