import { useEffect, useState } from 'react';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getOrderById } from '../../services/orderService';

function OrderDetails({ orderId, onBack }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        const response = await getOrderById(orderId);
        setOrder(response?.data || null);
      } catch (err) {
        setError(err.message || 'Unable to load order');
      } finally {
        setLoading(false);
      }
    }

    if (orderId) loadOrder();
  }, [orderId]);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40 sm:p-8">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-400">Orders</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Order details</h2>
        </div>
        <button type="button" onClick={onBack} className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800">Back</button>
      </div>

      {error ? <AlertMessage type="error" title="Error" message={error} /> : null}

      {loading ? (
        <LoadingSpinner label="Loading order details..." />
      ) : order ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-sm text-slate-300">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-slate-400">Order ID</p>
                <p className="mt-1 font-mono font-semibold text-white">{order._id}</p>
              </div>
              <div>
                <p className="text-slate-400">Customer</p>
                <p className="mt-1 font-semibold text-white">{order.customerName || order.user?.name || 'Customer'}</p>
                {order.customerPhone && <p className="text-xs text-slate-400">{order.customerPhone}</p>}
              </div>
              <div>
                <p className="text-slate-400">Expected Delivery Date</p>
                <p className="mt-1 font-semibold text-emerald-400">
                  {order.expectedDeliveryDate
                    ? new Date(order.expectedDeliveryDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Within 2-3 Days'}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Delivery Status</p>
                <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  order.deliveryStatus === 'delivered' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {order.deliveryStatus === 'delivered' ? '✅ Delivered' : '🚚 Pending'}
                </span>
              </div>
              <div>
                <p className="text-slate-400">Payment Status & Method</p>
                <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  order.paymentStatus === 'paid' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'} ({order.paymentMethod || 'UPI'})
                </span>
              </div>
              <div>
                <p className="text-slate-400">Total amount</p>
                <p className="mt-1 text-xl font-bold text-white">₹{order.totalAmount}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-sm text-slate-300">
            <h3 className="text-lg font-semibold text-white">Items</h3>
            <div className="mt-4 space-y-3">
              {(order.products || []).map((item, index) => {
                const product = item.product || {};
                const subtotal = Number(item.quantity || 0) * Number(item.price || 0);
                return (
                  <div key={`${product._id || index}`} className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-white">{product.name || 'Product'}</p>
                      <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p>Price: ₹{item.price}</p>
                      <p className="font-semibold text-white">Subtotal: ₹{subtotal}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-sm text-slate-300">
            <h3 className="text-lg font-semibold text-white">Shipping</h3>
            <div className="mt-4 space-y-1">
              <p>{order.shippingAddress?.address}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
              <p>{order.shippingAddress?.pincode}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default OrderDetails;
