import { useEffect, useMemo, useState } from 'react';
import AlertMessage from '../../components/AlertMessage';
import ConfirmModal from '../../components/ConfirmModal';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { deleteOrder, deliverOrder, getOrders, payOrder } from '../../services/orderService';

function OrdersPage({ onSwitchView, onViewOrder, onEditOrder, onCreateOrder }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders();
      setOrders(Array.isArray(response?.data) ? response.data : []);
      setError('');
    } catch (err) {
      setError(err.message || 'Unable to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleToggleDelivered = async (orderId) => {
    try {
      setActionLoadingId(orderId);
      await deliverOrder(orderId);
      setSuccess(`Order #${orderId.slice(-6)} marked as Delivered!`);
      await loadOrders();
    } catch (err) {
      setError(err.message || 'Failed to update delivery status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTogglePaid = async (orderId) => {
    try {
      setActionLoadingId(orderId);
      await payOrder(orderId);
      setSuccess(`Order #${orderId.slice(-6)} marked as Paid!`);
      await loadOrders();
    } catch (err) {
      setError(err.message || 'Failed to update payment status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    const query = search.toLowerCase();
    return orders.filter((order) => {
      const customer = order.customerName || order.user?.name || '';
      const destination = `${order.shippingAddress?.city || ''} ${order.shippingAddress?.address || ''}`;
      const matchesQuery =
        (order._id || '').toLowerCase().includes(query) ||
        customer.toLowerCase().includes(query) ||
        destination.toLowerCase().includes(query);
      const matchesStatus = status === 'all' || order.status === status || order.deliveryStatus === status;
      const matchesPayment = paymentStatus === 'all' || order.paymentStatus === paymentStatus;
      return matchesQuery && matchesStatus && matchesPayment;
    });
  }, [orders, paymentStatus, search, status]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteOrder(deleteTarget._id);
      setSuccess(`Deleted order #${deleteTarget._id.slice(-6)}`);
      setDeleteTarget(null);
      await loadOrders();
    } catch (err) {
      setError(err.message || 'Unable to delete order');
    } finally {
      setDeleting(false);
    }
  };

  const formatDelivery = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-sky-400">Order Management</p>
            <h2 className="mt-1 text-2xl font-bold text-white">Customer Orders & Deliveries</h2>
            <p className="text-xs text-slate-400">Monitor expected delivery dates, delivery fulfillment, customer addresses, and payments.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onCreateOrder}
              className="rounded-full bg-sky-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-sky-400 shadow-md shadow-sky-500/20"
            >
              + Manual Order
            </button>
          </div>
        </div>
      </div>

      {success ? <AlertMessage type="success" title="Success" message={success} /> : null}
      {error ? <AlertMessage type="error" title="Error" message={error} /> : null}

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by Order ID, customer, city..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-white outline-none focus:border-sky-500 lg:max-w-sm"
          />
          <div className="flex flex-wrap gap-3">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
            >
              <option value="all">All delivery statuses</option>
              <option value="pending">Pending Delivery</option>
              <option value="delivered">Delivered</option>
            </select>
            <select
              value={paymentStatus}
              onChange={(event) => setPaymentStatus(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
            >
              <option value="all">All payments</option>
              <option value="pending">Payment Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading orders..." />
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            title="No orders found"
            message="No orders match your search criteria. Customer orders will appear here automatically."
            actionLabel="Create manual order"
            onAction={onCreateOrder}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-xs">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="px-3 py-3 font-medium">Order ID</th>
                  <th className="px-3 py-3 font-medium">Customer Details</th>
                  <th className="px-3 py-3 font-medium">Destination</th>
                  <th className="px-3 py-3 font-medium">Total</th>
                  <th className="px-3 py-3 font-medium">Expected Delivery</th>
                  <th className="px-3 py-3 font-medium">Delivery Status</th>
                  <th className="px-3 py-3 font-medium">Payment</th>
                  <th className="px-3 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredOrders.map((order) => {
                  const isDelivered = order.deliveryStatus === 'delivered' || order.status === 'delivered';
                  const isPaid = order.paymentStatus === 'paid';
                  const customerName = order.customerName || order.user?.name || 'Customer';

                  return (
                    <tr key={order._id} className="text-slate-300 hover:bg-slate-900/40 transition">
                      <td className="px-3 py-3 font-mono font-semibold text-white">#{order._id?.slice(-6)}</td>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-white">{customerName}</div>
                        {order.customerPhone ? (
                          <div className="text-[11px] text-slate-400">{order.customerPhone}</div>
                        ) : null}
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-white">{order.shippingAddress?.city || '—'}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{order.shippingAddress?.address}</div>
                      </td>
                      <td className="px-3 py-3 font-bold text-white">₹{order.totalAmount}</td>
                      <td className="px-3 py-3">
                        <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/20">
                          <span>📅</span> {formatDelivery(order.expectedDeliveryDate)}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              isDelivered
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {isDelivered ? '✅ Delivered' : '🚚 Pending'}
                          </span>
                          {!isDelivered && (
                            <button
                              type="button"
                              disabled={actionLoadingId === order._id}
                              onClick={() => handleToggleDelivered(order._id)}
                              className="rounded-lg border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/10"
                            >
                              Deliver
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              isPaid
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {isPaid ? 'Paid' : 'Unpaid'}
                          </span>
                          {!isPaid && (
                            <button
                              type="button"
                              disabled={actionLoadingId === order._id}
                              onClick={() => handleTogglePaid(order._id)}
                              className="rounded-lg border border-sky-500/40 px-2 py-0.5 text-[10px] font-bold text-sky-300 hover:bg-sky-500/10"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => onViewOrder(order._id)}
                            className="rounded-full border border-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-800"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(order)}
                            className="rounded-full border border-rose-500/40 px-2.5 py-1 text-[11px] font-medium text-rose-300 hover:bg-rose-500/10"
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
        title="Delete order"
        message={`Are you sure you want to delete order ${deleteTarget?._id?.slice(-6) || ''}?`}
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

export default OrdersPage;
