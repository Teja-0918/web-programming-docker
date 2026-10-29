import { useEffect, useMemo, useState } from 'react';
import AlertMessage from '../../components/AlertMessage';
import ConfirmModal from '../../components/ConfirmModal';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { deleteUser, getUsers } from '../../services/userService';

function UsersPage({ onSwitchView, onViewUser, onEditUser, onCreateUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'customer' | 'admin'
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(Array.isArray(response?.data) ? response.data : []);
      setError('');
    } catch (err) {
      setError(err.message || 'Unable to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const stats = useMemo(() => {
    const total = users.length;
    const customers = users.filter((u) => u.role !== 'admin').length;
    const admins = users.filter((u) => u.role === 'admin').length;
    const totalOrders = users.reduce((sum, u) => sum + (u.orderCount || 0), 0);
    return { total, customers, admins, totalOrders };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase();
    return users.filter((user) => {
      const role = user.role || 'customer';
      const matchesRole = roleFilter === 'all' || role === roleFilter;

      const haystack = `${user.name || ''} ${user.email || ''} ${user.phone || ''} ${user.city || ''} ${user.role || ''}`.toLowerCase();
      const matchesQuery = haystack.includes(query);

      return matchesRole && matchesQuery;
    });
  }, [search, roleFilter, users]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteUser(deleteTarget._id);
      setSuccess(`Deleted ${deleteTarget.name}`);
      setDeleteTarget(null);
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Unable to delete user');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-400 border border-sky-500/20">
                User Management
              </span>
              <span className="text-xs text-slate-400">Customers & Administrators</span>
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
              Users & Customer Accounts
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Manage both customer accounts placing orders and administrator accounts managing the store.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onCreateUser}
              className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-sky-500/20 transition hover:bg-sky-400"
            >
              <span>➕</span>
              <span>Add New User</span>
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex items-center justify-between text-xs font-medium text-slate-400">
              <span>Total Accounts</span>
              <span>👥</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">{stats.total}</p>
          </div>

          <div className="rounded-2xl border border-sky-500/20 bg-sky-950/20 p-4">
            <div className="flex items-center justify-between text-xs font-medium text-sky-400">
              <span>Customers</span>
              <span>🛍️</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-sky-200">{stats.customers}</p>
          </div>

          <div className="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-4">
            <div className="flex items-center justify-between text-xs font-medium text-purple-400">
              <span>Administrators</span>
              <span>🛡️</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-purple-200">{stats.admins}</p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4">
            <div className="flex items-center justify-between text-xs font-medium text-emerald-400">
              <span>Orders Placed</span>
              <span>📦</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-200">{stats.totalOrders}</p>
          </div>
        </div>
      </div>

      {success ? <AlertMessage type="success" title="Success" message={success} /> : null}
      {error ? <AlertMessage type="error" title="Error" message={error} /> : null}

      {/* Main Table Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
        {/* Controls Bar: Filter tabs & Search */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Role Filter Tabs */}
          <div className="flex rounded-2xl border border-slate-800 bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => setRoleFilter('all')}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                roleFilter === 'all'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Users ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('customer')}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                roleFilter === 'customer'
                  ? 'bg-sky-500 text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🛍️ Customers ({stats.customers})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('admin')}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                roleFilter === 'admin'
                  ? 'bg-purple-500 text-slate-950 shadow font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🛡️ Admins ({stats.admins})
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, city..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition focus:border-sky-500 md:w-72"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading users and customer accounts..." />
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            title="No users match your criteria"
            message={
              roleFilter !== 'all'
                ? `No accounts found with role '${roleFilter}'. Try creating one or changing filters.`
                : 'No users found. Create your first customer or admin account.'
            }
            actionLabel="Add New User"
            onAction={onCreateUser}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800/80 text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3.5">User</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Contact Details</th>
                  <th className="px-4 py-3.5">Delivery Address</th>
                  <th className="px-4 py-3.5">Orders & Spend</th>
                  <th className="px-4 py-3.5">Joined</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredUsers.map((user) => {
                  const role = user.role || 'customer';
                  const isAdmin = role === 'admin';
                  const initials = (user.name || 'U')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr
                      key={user._id}
                      className="transition-colors hover:bg-slate-800/20 text-slate-300"
                    >
                      {/* Name & Avatar */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                              isAdmin
                                ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                                : 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20'
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{user.name}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Pill */}
                      <td className="px-4 py-3.5">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
                            <span>🛡️</span>
                            <span>Administrator</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300">
                            <span>🛍️</span>
                            <span>Customer</span>
                          </span>
                        )}
                      </td>

                      {/* Contact Details */}
                      <td className="px-4 py-3.5">
                        <p className="text-xs text-slate-200">
                          {user.phone ? (
                            <span className="font-mono text-slate-300">{user.phone}</span>
                          ) : (
                            <span className="text-slate-500 italic">No phone added</span>
                          )}
                        </p>
                        {user.age ? (
                          <p className="text-[11px] text-slate-400">Age: {user.age}</p>
                        ) : null}
                      </td>

                      {/* Delivery Address */}
                      <td className="px-4 py-3.5">
                        {user.city || user.address ? (
                          <div className="text-xs">
                            <p className="line-clamp-1 text-slate-200">{user.address || '—'}</p>
                            <p className="text-[11px] text-slate-400">
                              {[user.city, user.state, user.pincode].filter(Boolean).join(', ')}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">No address on file</span>
                        )}
                      </td>

                      {/* Orders & Spend */}
                      <td className="px-4 py-3.5">
                        {user.orderCount > 0 ? (
                          <div>
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/20">
                              📦 {user.orderCount} order{user.orderCount > 1 ? 's' : ''}
                            </span>
                            <p className="mt-0.5 text-xs font-bold text-white">
                              ₹{(user.totalSpent || 0).toLocaleString()}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">0 orders</span>
                        )}
                      </td>

                      {/* Registration Date */}
                      <td className="px-4 py-3.5 text-xs text-slate-400">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onViewUser(user._id)}
                            className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditUser(user)}
                            className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-300 transition hover:bg-sky-500/20"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(user)}
                            className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete User Account"
        message={`Are you sure you want to delete ${deleteTarget?.name || 'this user'}? Any orders attached will prevent deletion to preserve order records.`}
        confirmText="Yes, Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

export default UsersPage;
