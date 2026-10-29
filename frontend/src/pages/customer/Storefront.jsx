import { useEffect, useMemo, useState } from 'react';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { createOrder, payOrder } from '../../services/orderService';
import { getProducts } from '../../services/productService';
import { getUsers } from '../../services/userService';

function Storefront({ onNavigateToOrders }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Checkout modal state
  const [orderingProduct, setOrderingProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'UPI',
  });
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [payingNow, setPayingNow] = useState(false);
  const [orderModalError, setOrderModalError] = useState('');
  const [customerList, setCustomerList] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [prodRes, userRes] = await Promise.all([
        getProducts(),
        getUsers('customer').catch(() => ({ data: [] })),
      ]);
      setProducts(Array.isArray(prodRes?.data) ? prodRes.data : []);
      setCustomerList(Array.isArray(userRes?.data) ? userRes.data : []);
      setError('');
    } catch (err) {
      setError(err.message || 'Unable to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      const matchesSearch =
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q);
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, search, selectedCategory]);

  const calculateDeliveryDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + (Number(days) || 2));
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleOpenOrderModal = (product) => {
    setOrderingProduct(product);
    setQuantity(1);
    setPlacedOrder(null);
    setOrderModalError('');
    setSelectedCustomerId('');
    setCheckoutForm({
      name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      paymentMethod: 'UPI',
    });
  };

  const handleCustomerSelect = (e) => {
    const custId = e.target.value;
    setSelectedCustomerId(custId);
    if (!custId) return;
    const cust = customerList.find((c) => c._id === custId);
    if (cust) {
      setCheckoutForm((prev) => ({
        ...prev,
        name: cust.name || '',
        phone: cust.phone || '',
        address: cust.address || '',
        city: cust.city || '',
        state: cust.state || '',
        pincode: cust.pincode || '',
      }));
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCheckoutForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setOrderModalError('');

    if (!checkoutForm.name.trim()) {
      setOrderModalError('Please enter your full name');
      return;
    }
    if (!checkoutForm.phone.trim()) {
      setOrderModalError('Please enter your contact phone number');
      return;
    }
    if (!checkoutForm.address.trim() || !checkoutForm.city.trim() || !checkoutForm.pincode.trim()) {
      setOrderModalError('Please fill in complete delivery address details');
      return;
    }

    try {
      setSubmittingOrder(true);
      const payload = {
        user: selectedCustomerId || undefined,
        customerName: checkoutForm.name.trim(),
        customerPhone: checkoutForm.phone.trim(),
        products: [
          {
            product: orderingProduct._id,
            quantity: Number(quantity),
            price: orderingProduct.price,
          },
        ],
        shippingAddress: {
          address: checkoutForm.address.trim(),
          city: checkoutForm.city.trim(),
          state: checkoutForm.state.trim() || 'State',
          pincode: checkoutForm.pincode.trim(),
        },
        paymentMethod: checkoutForm.paymentMethod,
        paymentStatus: 'pending',
      };

      const res = await createOrder(payload);
      if (res?.data) {
        setPlacedOrder(res.data);
        await loadProducts(); // Refresh stock
      }
    } catch (err) {
      setOrderModalError(err.message || 'Failed to place order');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handlePayAmount = async () => {
    if (!placedOrder?._id) return;
    try {
      setPayingNow(true);
      const res = await payOrder(placedOrder._id);
      if (res?.data) {
        setPlacedOrder(res.data);
      }
    } catch (err) {
      setOrderModalError(err.message || 'Payment simulation failed');
    } finally {
      setPayingNow(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-sky-950/40 p-8 shadow-2xl sm:p-10">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300">
            <span>✨</span> Next-Day & Express Doorstep Delivery
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Shop the latest products with guaranteed delivery dates.
          </h2>
          <p className="text-sm leading-relaxed text-slate-300">
            Browse our curated store. Each product shows its expected delivery date before you order. Place an order in seconds and pay online or with Cash on Delivery!
          </p>
        </div>
      </div>

      {error ? <AlertMessage type="error" title="Error" message={error} /> : null}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title or description..."
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-2 text-xs font-semibold capitalize transition ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'border border-slate-800 bg-slate-900/70 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <LoadingSpinner label="Loading storefront products..." />
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
          <span className="text-4xl">📦</span>
          <h3 className="mt-4 text-lg font-semibold text-white">No products found</h3>
          <p className="mt-1 text-sm text-slate-400">
            Try adjusting your search or category filter. Admins can add products anytime!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const deliveryDays = product.deliveryDays || 2;
            const deliveryDateStr = calculateDeliveryDate(deliveryDays);
            const inStock = (product.stock ?? 0) > 0 && product.isavail;

            return (
              <div
                key={product._id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/40 hover:shadow-2xl hover:shadow-sky-500/5"
              >
                <div>
                  {/* Product Image */}
                  <div className="relative mb-4 h-48 w-full overflow-hidden rounded-2xl bg-slate-950">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl text-slate-700">
                        🛍️
                      </div>
                    )}
                    <span className="absolute top-3 right-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-[11px] font-semibold text-slate-300 backdrop-blur-md">
                      {product.category}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
                    {product.description}
                  </p>

                  {/* Expected Delivery Date Highlight */}
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300">
                    <span>🚚</span>
                    <div>
                      <span>Expected Delivery: </span>
                      <strong className="text-emerald-200">{deliveryDateStr}</strong>
                      <span className="text-[10px] text-emerald-400 block">({deliveryDays} day delivery)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
                  <div>
                    <span className="text-xs text-slate-400">Price</span>
                    <p className="text-2xl font-bold text-white">₹{product.price}</p>
                    <span className={`text-[11px] font-medium ${inStock ? 'text-slate-400' : 'text-rose-400'}`}>
                      {inStock ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={!inStock}
                    onClick={() => handleOpenOrderModal(product)}
                    className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-sky-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {inStock ? 'Order Now ⚡' : 'Sold Out'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Order / Checkout Modal */}
      {orderingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
            {!placedOrder ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-bold tracking-widest text-sky-400 uppercase">Checkout</span>
                    <h3 className="text-xl font-semibold text-white">Place Your Order</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOrderingProduct(null)}
                    className="rounded-full border border-slate-800 bg-slate-950 p-2 text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Product Summary */}
                <div className="mt-4 flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  {orderingProduct.imageUrl ? (
                    <img
                      src={orderingProduct.imageUrl}
                      alt={orderingProduct.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-900 text-2xl">
                      🛍️
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{orderingProduct.name}</h4>
                    <p className="text-sm font-bold text-sky-400">₹{orderingProduct.price}</p>
                    <p className="text-xs text-emerald-400">
                      📅 Expected by: {calculateDeliveryDate(orderingProduct.deliveryDays || 2)}
                    </p>
                  </div>
                </div>

                {orderModalError ? (
                  <div className="mt-4">
                    <AlertMessage type="error" message={orderModalError} />
                  </div>
                ) : null}

                {/* Checkout Form */}
                <form onSubmit={handlePlaceOrder} className="mt-5 space-y-4">
                  {/* Optional Customer Profile Selector */}
                  {customerList.length > 0 && (
                    <div className="rounded-2xl border border-sky-500/20 bg-sky-950/20 p-3">
                      <label className="mb-1 block text-xs font-semibold text-sky-400">
                        👤 Select Registered Customer (Instant Autofill)
                      </label>
                      <select
                        value={selectedCustomerId}
                        onChange={handleCustomerSelect}
                        className="w-full rounded-xl border border-sky-500/30 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-sky-400"
                      >
                        <option value="">-- Guest Checkout / Type Manually --</option>
                        {customerList.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name} ({c.phone || c.email} {c.city ? `• ${c.city}` : ''})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-300">Your Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={checkoutForm.name}
                        onChange={handleFormChange}
                        placeholder="John Doe"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-300">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={checkoutForm.phone}
                        onChange={handleFormChange}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">Delivery Address *</label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={checkoutForm.address}
                      onChange={handleFormChange}
                      placeholder="House/Flat No, Street, Landmark"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-300">City *</label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={checkoutForm.city}
                        onChange={handleFormChange}
                        placeholder="City"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-300">State</label>
                      <input
                        type="text"
                        name="state"
                        value={checkoutForm.state}
                        onChange={handleFormChange}
                        placeholder="State"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-300">Pincode *</label>
                      <input
                        type="text"
                        name="pincode"
                        required
                        value={checkoutForm.pincode}
                        onChange={handleFormChange}
                        placeholder="Pincode"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-300">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        max={orderingProduct.stock || 1}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-300">Payment Option</label>
                      <select
                        name="paymentMethod"
                        value={checkoutForm.paymentMethod}
                        onChange={handleFormChange}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                      >
                        <option value="UPI">Pay Online (UPI / Card)</option>
                        <option value="COD">Cash on Delivery (COD)</option>
                      </select>
                    </div>
                  </div>

                  {/* Summary Row */}
                  <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
                    <span className="text-sm text-slate-300">Total Due</span>
                    <span className="text-xl font-bold text-white">
                      ₹{(orderingProduct.price * (Number(quantity) || 1)).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setOrderingProduct(null)}
                      className="rounded-full border border-slate-700 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingOrder}
                      className="rounded-full bg-sky-500 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-sky-500/20 hover:bg-sky-400 disabled:opacity-50"
                    >
                      {submittingOrder ? 'Placing Order...' : 'Confirm Order 🚀'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Order Success & Pay Now Simulation View */
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-3xl text-emerald-400 border border-emerald-500/30">
                  🎉
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white">Order Placed Successfully!</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Order ID: <span className="font-mono text-sky-400">{placedOrder._id}</span>
                  </p>
                </div>

                {/* Delivery Date Highlight */}
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🚚</span>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                        Expected Delivery Date
                      </p>
                      <p className="text-lg font-bold text-white">
                        {placedOrder.expectedDeliveryDate
                          ? new Date(placedOrder.expectedDeliveryDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'Within 2-3 Days'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Delivering to: {placedOrder.shippingAddress?.address}, {placedOrder.shippingAddress?.city}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Simulation Section */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Payment Status</p>
                      <p className="font-bold text-white">
                        {placedOrder.paymentStatus === 'paid' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400">
                            <span>✅</span> Paid (₹{placedOrder.totalAmount})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-400">
                            <span>⏳</span> Payment Pending (₹{placedOrder.totalAmount})
                          </span>
                        )}
                      </p>
                    </div>

                    {placedOrder.paymentStatus !== 'paid' && (
                      <button
                        type="button"
                        disabled={payingNow}
                        onClick={handlePayAmount}
                        className="rounded-full bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 disabled:opacity-50"
                      >
                        {payingNow ? 'Processing...' : `💳 Pay Amount (₹${placedOrder.totalAmount})`}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOrderingProduct(null);
                      setPlacedOrder(null);
                    }}
                    className="rounded-full border border-slate-700 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Continue Shopping
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderingProduct(null);
                      setPlacedOrder(null);
                      if (onNavigateToOrders) onNavigateToOrders();
                    }}
                    className="rounded-full bg-sky-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-sky-400"
                  >
                    View My Orders
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Storefront;
