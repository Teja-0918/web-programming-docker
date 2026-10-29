import { useEffect, useState } from 'react';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { deliverOrder, payOrder } from '../../services/orderService';
import { getUserById } from '../../services/userService';

function UserDetails({ userId, onBack }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await getUserById(userId);
      setUser(response?.data || null);
    } catch (err) {
      setError(err.message || 'Unable to load user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const handleDeliver = async (orderId) => {
    try {
      setActionLoading(true);
      await deliverOrder(orderId);
      setSuccess('Order marked as delivered!');
      await loadUser();
    } catch (err) {
      setError(err.message || 'Failed to update delivery status');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePay = async (orderId) => {
    try {
      setActionLoading(true);
      await payOrder(orderId);
      setSuccess('Order marked as paid!');
      await loadUser();
    } catch (err) {
      setError(err.message || 'Failed to update payment status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
        <LoadingSpinner label="Loading account & order details..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center text-slate-300">
        <p className="text-lg">User not found.</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 rounded-full bg-sky-500 px-5 py-2 text-xs font-bold text-slate-950"
        >
          Back to Users
        </button>
      </div>
    );
  }

  const role = user.role || 'customer';
  const isAdmin = role === 'admin';
  const orders = Array.isArray(user.orders) ? user.orders : [];
  const initials = (user.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold shadow-lg ${
                isAdmin
                  ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/20'
                  : 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sky-500/20'
              }`}
            >
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-0.5 text-xs font-semibold text-purple-300">
                    <span>🛡️</span>
                    <span>Administrator</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-0.5 text-xs font-semibold text-sky-300">
                    <span>🛍️</span>
                    <span>Customer</span>
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                User ID: <span className="font-mono text-slate-300">{user._id}</span> • Member since{' '}
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-slate-700 bg-slate-950 px-5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            ← Back to Users
          </button>
        </div>

        {/* Metrics Strip */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
            <span className="text-xs text-slate-400">Account Type</span>
            <p className="mt-1 font-semibold text-white capitalize">{user.role || 'Customer'}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
            <span className="text-xs text-slate-400">Phone Number</span>
            <p className="mt-1 font-semibold text-white">{user.phone || '—'}</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4">
            <span className="text-xs text-emerald-400">Total Orders</span>
            <p className="mt-1 text-xl font-bold text-emerald-200">{orders.length}</p>
          </div>
          <div className="rounded-2xl border border-sky-500/20 bg-sky-950/20 p-4">
            <span className="text-xs text-sky-400">Total Spent</span>
            <p className="mt-1 text-xl font-bold text-sky-200">
              ₹{(user.totalSpent || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {success ? <AlertMessage type="success" title="Success" message={success} /> : null}
      {error ? <AlertMessage type="error" title="Error" message={error} /> : null}

      {/* Profile Details & Shipping Address */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Info Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl backdrop-blur-xl">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-300">
            Contact & Account Details
          </h3>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Email</span>
              <span className="font-semibold text-white">{user.email}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Phone</span>
              <span className="font-semibold text-white">{user.phone || 'Not provided'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Age</span>
              <span className="font-semibold text-white">{user.age || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Role Status</span>
              <span className="font-semibold text-white capitalize">{user.role || 'customer'}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl backdrop-blur-xl">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-300">
            Default Delivery Address
          </h3>
          {user.address || user.city ? (
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Street</span>
                <span className="font-semibold text-white">{user.address || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">City</span>
                <span className="font-semibold text-white">{user.city || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">State</span>
                <span className="font-semibold text-white">{user.state || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pincode</span>
                <span className="font-semibold text-white font-mono">{user.pincode || '—'}</span>
              </div>
            </div>
          ) : (
            <div className="flex h-32 flex-col items-center justify-center text-center text-slate-500">
              <span className="text-2xl">📍</span>
              <p className="mt-1 text-xs italic">No default address registered for this user.</p>
            </div>
          )}
        </div>
      </div>

      {/* Associated Orders Section */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Order History</h3>
            <p className="text-xs text-slate-400">
              All orders associated with {user.name} ({orders.length} order{orders.length === 1 ? '' : 's'})
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-8 text-center text-slate-400">
            <span className="text-3xl">📦</span>
            <p className="mt-2 text-sm font-semibold text-white">No orders placed yet</p>
            <p className="text-xs text-slate-500">
              When this customer places an order on the storefront, it will appear here with full delivery tracking.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-3 py-3">Order ID</th>
                  <th className="px-3 py-3">Products</th>
                  <th className="px-3 py-3">Total Amount</th>
                  <th className="px-3 py-3">Expected Delivery</th>
                  <th className="px-3 py-3">Delivery Status</th>
                  <th className="px-3 py-3">Payment</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {orders.map((order) => {
                  const isDelivered = order.deliveryStatus === 'delivered' || order.status === 'delivered';
                  const isPaid = order.paymentStatus === 'paid';
                  const deliveryDate = order.expectedDeliveryDate
                    ? new Date(order.expectedDeliveryDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '2-3 days';

                  return (
                    <tr key={order._id} className="text-slate-300 hover:bg-slate-800/20">
                      <td className="px-3 py-3 font-mono text-xs text-sky-400">
                        {order._id.slice(-8).toUpperCase()}
                      </td>

                      <td className="px-3 py-3">
                        <div className="space-y-1">
                          {order.products?.map((item, idx) => (
                            <p key={idx} className="text-xs text-white">
                              {item.product?.name || 'Product'} × {item.quantity}
                            </p>
                          ))}
                        </div>
                      </td>

                      <td className="px-3 py-3 font-bold text-white">
                        ₹{(order.totalAmount || 0).toLocaleString()}
                      </td>

                      <td className="px-3 py-3">
                        <div className="text-xs">
                          <p className="font-semibold text-emerald-300">📅 {deliveryDate}</p>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        {isDelivered ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                            ✓ Delivered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                            🚚 In Transit
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-3">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                            ✅ Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
                            ⏳ Pending
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isDelivered && (
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleDeliver(order._id)}
                              className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30"
                            >
                              Deliver
                            </button>
                          )}
                          {!isPaid && (
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handlePay(order._id)}
                              className="rounded-lg bg-sky-500/20 border border-sky-500/40 px-2.5 py-1 text-xs font-bold text-sky-300 hover:bg-sky-500/30"
                            >
                              Pay
                            </button>
                          )}
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
    </div>
  );
}

export default UserDetails;
