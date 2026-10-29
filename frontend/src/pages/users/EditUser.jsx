import { useEffect, useState } from 'react';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { updateUser } from '../../services/userService';

function EditUser({ user, onCancel, onUpdated }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'customer',
    phone: '',
    age: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'customer',
        phone: user.phone || '',
        age: user.age ?? '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSetRole = (role) => {
    setForm((current) => ({ ...current, role }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (!form.name.trim()) throw new Error('Name is required');
      if (!form.email.trim()) throw new Error('Email is required');
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(form.email)) throw new Error('Please enter a valid email address');
      if (form.age !== '') {
        const age = Number(form.age);
        if (!Number.isInteger(age) || age < 1) throw new Error('Age must be a positive whole number');
      }

      setLoading(true);
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role || 'customer',
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        ...(form.age !== '' ? { age: Number(form.age) } : {}),
      };
      const response = await updateUser(user._id, payload);
      setSuccess('User updated successfully');
      if (onUpdated) onUpdated(response?.data);
    } catch (err) {
      setError(err.message || 'Unable to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl sm:p-8">
      <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
            Account Management
          </span>
          <h2 className="mt-1 text-2xl font-bold text-white">Edit User: {user?.name}</h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-slate-700 bg-slate-950 px-4 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
        >
          Cancel
        </button>
      </div>

      {success ? <AlertMessage type="success" title="Success" message={success} /> : null}
      {error ? <AlertMessage type="error" title="Validation Error" message={error} /> : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Role Selection */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Account Role
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleSetRole('customer')}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                form.role === 'customer'
                  ? 'border-sky-500 bg-sky-950/30 ring-1 ring-sky-500'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-xl text-sky-400">
                🛍️
              </div>
              <div>
                <p className="font-bold text-white">Customer Account</p>
                <p className="mt-0.5 text-xs text-slate-400">Places orders and tracks deliveries.</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSetRole('admin')}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                form.role === 'admin'
                  ? 'border-purple-500 bg-purple-950/30 ring-1 ring-purple-500'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-xl text-purple-400">
                🛡️
              </div>
              <div>
                <p className="font-bold text-white">Administrator Account</p>
                <p className="mt-0.5 text-xs text-slate-400">Manages products, delivery times, and orders.</p>
              </div>
            </button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-300">
            Basic Information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-user-name" className="mb-1 block text-xs font-medium text-slate-300">
                Full Name *
              </label>
              <input
                id="edit-user-name"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label htmlFor="edit-user-email" className="mb-1 block text-xs font-medium text-slate-300">
                Email Address *
              </label>
              <input
                id="edit-user-email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label htmlFor="edit-user-phone" className="mb-1 block text-xs font-medium text-slate-300">
                Phone Number
              </label>
              <input
                id="edit-user-phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label htmlFor="edit-user-age" className="mb-1 block text-xs font-medium text-slate-300">
                Age
              </label>
              <input
                id="edit-user-age"
                name="age"
                type="number"
                min="1"
                value={form.age}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-300">
            Delivery Address
          </h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="edit-user-address" className="mb-1 block text-xs font-medium text-slate-300">
                Street Address
              </label>
              <input
                id="edit-user-address"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="edit-user-city" className="mb-1 block text-xs font-medium text-slate-300">
                  City
                </label>
                <input
                  id="edit-user-city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label htmlFor="edit-user-state" className="mb-1 block text-xs font-medium text-slate-300">
                  State
                </label>
                <input
                  id="edit-user-state"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label htmlFor="edit-user-pincode" className="mb-1 block text-xs font-medium text-slate-300">
                  Pincode
                </label>
                <input
                  id="edit-user-pincode"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-700 bg-slate-950 px-6 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-sky-500 px-7 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-sky-500/20 transition hover:bg-sky-400 disabled:opacity-50"
          >
            {loading ? <LoadingSpinner label="Saving..." /> : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditUser;
