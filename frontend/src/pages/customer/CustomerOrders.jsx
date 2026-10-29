import { useEffect, useState } from 'react';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getOrders, payOrder } from '../../services/orderService';

function CustomerOrders({ onNavigateToStore }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [payingOrderId, setPayingOrderId] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrders();
      setOrders(Array.isArray(res?.data) ? res.data : []);
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

  const handlePay = async (orderId, amount) => {
    try {
      setPayingOrderId(orderId);
      await payOrder(orderId);
      setSuccess(`Payment of ₹${amount} completed successfully!`);
      await loadOrders();
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setPayingOrderId(null);
    }
  };

  const formatDeliveryDate = (dateString) => {
    if (!dateString) return 'Within 2-3 Days';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 shadow-2xl">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400">Order Tracking</span>
          <h2 className="mt-1 text-2xl font-bold text-white">My Orders & Deliveries</h2>
          <p className="mt-1 text-xs text-slate-400">
            Track order delivery dates, inspect shipping addresses, and settle pending payments.
          </p>
        </div>
        <button
          type="button"
          onClick={onNavigateToStore}
          className="rounded-full bg-sky-500 px-5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-sky-400 shadow-md shadow-sky-500/20"
        >
          + Continue Shopping
        </button>
      </div>

      {success ? <AlertMessage type="success" title="Success" message={success} /> : null}
      {error ? <AlertMessage type="error" title="Error" message={error} /> : null}

      {loading ? (
        <LoadingSpinner label="Loading your orders..." />
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
          <span className="text-4xl">🛍️</span>
          <h3 className="mt-4 text-lg font-semibold text-white">No orders placed yet</h3>
          <p className="mt-1 text-sm text-slate-400">
            Browse our store, choose a product, and place your first order!
          </p>
          <button
            type="button"
            onClick={onNavigateToStore}
            className="mt-5 rounded-full bg-sky-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-sky-400 shadow-lg shadow-sky-500/20"
          >
            Explore Store
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isDelivered = order.deliveryStatus === 'delivered' || order.status === 'delivered';
            const isPaid = order.paymentStatus === 'paid';
            const deliveryDateStr = formatDeliveryDate(order.expectedDeliveryDate);

            return (
              <div
                key={order._id}
                className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl transition hover:border-slate-700"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-slate-800 px-2.5 py-1 font-mono text-xs text-sky-400 font-semibold">
                      #{order._id.slice(-6)}
                    </span>
                    <span className="text-xs text-slate-400">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Delivery Status Badge */}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isDelivered
                          ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                          : 'border border-sky-500/30 bg-sky-500/10 text-sky-300'
                      }`}
                    >
                      {isDelivered ? '✅ Delivered' : '🚚 In Transit'}
                    </span>

                    {/* Payment Status Badge */}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isPaid
                          ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                          : 'border border-amber-500/30 bg-amber-500/10 text-amber-300'
                      }`}
                    >
                      {isPaid ? '💳 Paid' : '⏳ Payment Pending'}
                    </span>
                  </div>
                </div>

                {/* Main Content Details */}
                <div className="mt-5 grid gap-6 md:grid-cols-3">
                  {/* Column 1: Ordered Items */}
                  <div className="space-y-3 md:col-span-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ordered Products</h4>
                    <div className="space-y-2">
                      {(order.products || []).map((item, idx) => {
                        const product = item.product || {};
                        return (
                          <div key={idx} className="flex items-center gap-3 rounded-xl bg-slate-950/60 p-2.5 border border-slate-800/60">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-sm">
                                🛍️
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-xs font-semibold text-white">{product.name || 'Product'}</p>
                              <p className="text-[11px] text-slate-400">
                                Qty: {item.quantity} × ₹{item.price}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Column 2: Expected Delivery & Shipping */}
                  <div className="space-y-2 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-4 md:col-span-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <span>🚚</span> Expected Delivery Date
                    </span>
                    <p className="text-lg font-bold text-white">{deliveryDateStr}</p>
                    <div className="pt-2 text-xs text-slate-300 border-t border-emerald-500/10 space-y-0.5">
                      <p className="font-semibold text-slate-200">Customer: {order.customerName || order.user?.name || 'Customer'}</p>
                      <p>{order.shippingAddress?.address}</p>
                      <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                    </div>
                  </div>

                  {/* Column 3: Total & Pay Action */}
                  <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-4 md:col-span-1">
                    <div>
                      <span className="text-xs text-slate-400">Total Order Amount</span>
                      <p className="text-2xl font-black text-white">₹{order.totalAmount}</p>
                      <span className="text-[11px] text-slate-400">Payment via: {order.paymentMethod || 'UPI'}</span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800">
                      {!isPaid ? (
                        <button
                          type="button"
                          disabled={payingOrderId === order._id}
                          onClick={() => handlePay(order._id, order.totalAmount)}
                          className="w-full rounded-full bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 disabled:opacity-50 transition"
                        >
                          {payingOrderId === order._id ? 'Processing Payment...' : `💳 Pay Amount (₹${order.totalAmount})`}
                        </button>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 py-2 text-xs font-semibold text-emerald-300">
                          <span>✅</span> Payment Settled
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CustomerOrders;
