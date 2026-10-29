function Navbar({ mode, onModeChange, activeView, onNavigate }) {
  const adminLinks = [
    { id: 'home', label: 'Dashboard' },
    { id: 'products', label: 'Products' },
    { id: 'orders', label: 'Orders' },
    { id: 'users', label: 'Users' },
  ];

  const customerLinks = [
    { id: 'store', label: 'Browse Products' },
    { id: 'customer-orders', label: 'My Orders' },
  ];

  const currentLinks = mode === 'customer' ? customerLinks : adminLinks;

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-slate-950 font-black shadow-lg shadow-sky-500/20">
            NX
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-widest text-sky-400 uppercase">MERNexus</span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                {mode === 'customer' ? 'Customer Portal' : 'Admin Console'}
              </span>
            </div>
            <h1 className="text-lg font-semibold text-white">
              {mode === 'customer' ? 'E-Commerce Store' : 'Store Management'}
            </h1>
          </div>
        </div>

        {/* Portal Switcher & Navigation Links */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Switcher Pill */}
          <div className="flex rounded-full border border-slate-800 bg-slate-900/90 p-1">
            <button
              type="button"
              onClick={() => onModeChange('customer')}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                mode === 'customer'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🛍️</span>
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => onModeChange('admin')}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                mode === 'admin'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>⚙️</span>
              <span>Admin</span>
            </button>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* Section Links */}
          <div className="flex flex-wrap gap-2">
            {currentLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => onNavigate(link.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  activeView === link.id
                    ? mode === 'customer'
                      ? 'bg-sky-400/15 text-sky-300 border border-sky-500/30'
                      : 'bg-indigo-400/15 text-indigo-300 border border-indigo-500/30'
                    : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
