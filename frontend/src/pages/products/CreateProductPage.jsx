import { useState } from 'react';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { createProduct } from '../../services/productService';

const SAMPLE_PRESETS = [
  {
    name: 'Wireless Noise-Canceling Headphones',
    category: 'Electronics',
    price: 2999,
    stock: 25,
    deliveryDays: 2,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    description: 'High-fidelity audio with 40h battery life and active noise cancellation.',
  },
  {
    name: 'Fitness Smartwatch Pro',
    category: 'Electronics',
    price: 3499,
    stock: 18,
    deliveryDays: 3,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
    description: 'AMOLED display, heart-rate tracking, SpO2 sensor and 14-day battery.',
  },
  {
    name: 'Urban Canvas Backpack',
    category: 'Accessories',
    price: 1499,
    stock: 30,
    deliveryDays: 4,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
    description: 'Water-resistant travel backpack with 15.6 inch padded laptop compartment.',
  },
  {
    name: 'Mechanical Gaming Keyboard',
    category: 'Gaming',
    price: 3999,
    stock: 12,
    deliveryDays: 2,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600',
    description: 'RGB backlit mechanical keyboard with tactile blue switches and aluminum frame.',
  },
];

const initialState = {
  name: '',
  description: '',
  price: '',
  category: '',
  stock: '',
  imageUrl: '',
  deliveryDays: 2,
  isavail: true,
};

function CreateProductPage({ onBack, onCreated }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const applyPreset = (preset) => {
    setForm({
      name: preset.name,
      description: preset.description,
      price: String(preset.price),
      category: preset.category,
      stock: String(preset.stock),
      imageUrl: preset.imageUrl,
      deliveryDays: preset.deliveryDays,
      isavail: true,
    });
  };

  const validate = () => {
    if (!form.name.trim()) throw new Error('Product name is required');
    if (!form.description.trim()) throw new Error('Description is required');
    if (!form.category.trim()) throw new Error('Category is required');
    const price = Number(form.price);
    if (Number.isNaN(price) || price < 0) throw new Error('Price must be zero or greater');
    const stock = Number(form.stock);
    if (Number.isNaN(stock) || stock < 0) throw new Error('Stock must be zero or greater');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    try {
      validate();
      setLoading(true);
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category.trim(),
        stock: Number(form.stock),
        imageUrl: form.imageUrl.trim(),
        deliveryDays: Number(form.deliveryDays) || 2,
        isavail: form.isavail,
      };
      const response = await createProduct(payload);
      setSuccess(`Product created successfully with id ${response?.data?._id || 'unknown'}`);
      setForm(initialState);
      if (onCreated) onCreated(response?.data);
    } catch (err) {
      setError(err.message || 'Unable to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-sky-400">Inventory Management</p>
          <h2 className="mt-1 text-2xl font-bold text-white">Add New Product</h2>
          <p className="text-xs text-slate-400">Set product image, pricing, stock, and delivery timeline for customer orders.</p>
        </div>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            ← Back to Products
          </button>
        ) : null}
      </div>

      {/* Quick Fill Presets */}
      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <span className="text-xs font-semibold text-slate-300">⚡ Quick Fill Sample Products:</span>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {SAMPLE_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-300 hover:border-sky-500/50 hover:text-white transition"
            >
              + {p.name.slice(0, 24)}...
            </button>
          ))}
        </div>
      </div>

      {success ? <AlertMessage type="success" title="Success" message={success} /> : null}
      {error ? <AlertMessage type="error" title="Validation error" message={error} /> : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="product-name" className="mb-2 block text-xs font-medium text-slate-200">
            Product name *
          </label>
          <input
            id="product-name"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-sky-500"
            placeholder="e.g. Wireless Noise-Canceling Headphones"
          />
        </div>

        <div>
          <label htmlFor="product-description" className="mb-2 block text-xs font-medium text-slate-200">
            Description *
          </label>
          <textarea
            id="product-description"
            name="description"
            required
            value={form.description}
            onChange={handleChange}
            rows="3"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-sky-500"
            placeholder="Key features, specifications, and details"
          />
        </div>

        {/* Image URL & Live Preview */}
        <div>
          <label htmlFor="product-image" className="mb-2 block text-xs font-medium text-slate-200">
            Product Image URL
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="product-image"
              name="imageUrl"
              type="url"
              value={form.imageUrl}
              onChange={handleChange}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-sky-500"
              placeholder="https://images.unsplash.com/photo-..."
            />
            {form.imageUrl && (
              <div className="h-12 w-12 overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
                <img
                  src={form.imageUrl}
                  alt="preview"
                  className="h-full w-full object-cover"
                  onError={(e) => (e.target.style.display = 'none')}
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="product-price" className="mb-2 block text-xs font-medium text-slate-200">
              Price (₹) *
            </label>
            <input
              id="product-price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
              value={form.price}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-sky-500"
              placeholder="1999"
            />
          </div>

          <div>
            <label htmlFor="product-category" className="mb-2 block text-xs font-medium text-slate-200">
              Category *
            </label>
            <input
              id="product-category"
              name="category"
              required
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-sky-500"
              placeholder="Electronics"
            />
          </div>

          <div>
            <label htmlFor="product-stock" className="mb-2 block text-xs font-medium text-slate-200">
              Stock Quantity *
            </label>
            <input
              id="product-stock"
              name="stock"
              type="number"
              min="0"
              required
              value={form.stock}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-sky-500"
              placeholder="20"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Configurable Delivery Days */}
          <div>
            <label htmlFor="product-delivery-days" className="mb-2 block text-xs font-medium text-emerald-400">
              🚚 Expected Delivery (Days from Order) *
            </label>
            <input
              id="product-delivery-days"
              name="deliveryDays"
              type="number"
              min="1"
              max="30"
              required
              value={form.deliveryDays}
              onChange={handleChange}
              className="w-full rounded-xl border border-emerald-500/40 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
              placeholder="2"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Customers will see delivery date calculated as: Today + {form.deliveryDays || 2} days.
            </p>
          </div>

          <div className="flex items-center">
            <label className="flex w-full items-center justify-between rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 cursor-pointer">
              <span>Mark Available for Order</span>
              <input
                name="isavail"
                type="checkbox"
                checked={form.isavail}
                onChange={handleChange}
                className="h-5 w-5 rounded border-slate-600 bg-slate-900 text-sky-500"
              />
            </label>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center rounded-full bg-sky-500 px-6 py-3 text-xs font-bold text-slate-950 transition hover:bg-sky-400 shadow-lg shadow-sky-500/20 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <LoadingSpinner label="Adding product..." /> : 'Add Product to Store 🚀'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateProductPage;

