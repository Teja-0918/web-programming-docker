import { useEffect, useState } from 'react';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { updateProduct } from '../../services/productService';

function EditProduct({ product, onCancel, onUpdated }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    imageUrl: '',
    deliveryDays: 2,
    isavail: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price ?? '',
        category: product.category || '',
        stock: product.stock ?? '',
        imageUrl: product.imageUrl || '',
        deliveryDays: product.deliveryDays ?? 2,
        isavail: Boolean(product.isavail),
      });
    }
  }, [product]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (!form.name.trim()) throw new Error('Product name is required');
      if (!form.description.trim()) throw new Error('Description is required');
      if (!form.category.trim()) throw new Error('Category is required');
      const price = Number(form.price);
      if (Number.isNaN(price) || price < 0) throw new Error('Price must be zero or greater');
      const stock = Number(form.stock);
      if (Number.isNaN(stock) || stock < 0) throw new Error('Stock must be zero or greater');
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
      const response = await updateProduct(product._id, payload);
      setSuccess('Product updated successfully');
      if (onUpdated) onUpdated(response?.data);
    } catch (err) {
      setError(err.message || 'Unable to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl sm:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-sky-400">Products</p>
          <h2 className="mt-1 text-2xl font-bold text-white">Edit Product</h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
        >
          Cancel
        </button>
      </div>
      {success ? <AlertMessage type="success" title="Success" message={success} /> : null}
      {error ? <AlertMessage type="error" title="Validation error" message={error} /> : null}
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="edit-product-name" className="mb-2 block text-xs font-medium text-slate-200">
            Product name *
          </label>
          <input
            id="edit-product-name"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-sky-500"
          />
        </div>
        <div>
          <label htmlFor="edit-product-description" className="mb-2 block text-xs font-medium text-slate-200">
            Description *
          </label>
          <textarea
            id="edit-product-description"
            name="description"
            required
            value={form.description}
            onChange={handleChange}
            rows="3"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label htmlFor="edit-product-image" className="mb-2 block text-xs font-medium text-slate-200">
            Product Image URL
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="edit-product-image"
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
            <label htmlFor="edit-product-price" className="mb-2 block text-xs font-medium text-slate-200">
              Price (₹) *
            </label>
            <input
              id="edit-product-price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
              value={form.price}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label htmlFor="edit-product-category" className="mb-2 block text-xs font-medium text-slate-200">
              Category *
            </label>
            <input
              id="edit-product-category"
              name="category"
              required
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label htmlFor="edit-product-stock" className="mb-2 block text-xs font-medium text-slate-200">
              Stock Quantity *
            </label>
            <input
              id="edit-product-stock"
              name="stock"
              type="number"
              min="0"
              required
              value={form.stock}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="edit-product-delivery-days" className="mb-2 block text-xs font-medium text-emerald-400">
              🚚 Expected Delivery (Days from Order) *
            </label>
            <input
              id="edit-product-delivery-days"
              name="deliveryDays"
              type="number"
              min="1"
              max="30"
              required
              value={form.deliveryDays}
              onChange={handleChange}
              className="w-full rounded-xl border border-emerald-500/40 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
            />
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

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center rounded-full bg-sky-500 px-6 py-3 text-xs font-bold text-slate-950 transition hover:bg-sky-400 shadow-lg shadow-sky-500/20 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? <LoadingSpinner label="Updating product..." /> : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

export default EditProduct;
