import { useState } from 'react';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { createUser } from '../../services/userService';

const initialState = {
  name: '',
  email: '',
  role: 'customer',
  phone: '',
  age: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
};

function CreateUserPage({ onBack, onCreated }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSetRole = (role) => {
    setForm((current) => ({ ...current, role }));
  };

  const applySampleCustomer = () => {
    const rand = Math.floor(100 + Math.random() * 900);
    setForm({
      name: `Vikram Malhotra ${rand}`,
      email: `vikram.${rand}@example.com`,
      role: 'customer',
      phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
      age: 29,
      address: 'Plot 45, Jubilee Enclave',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500033',
    });
  };

  const applySampleAdmin = () => {
    const rand = Math.floor(10 + Math.random() * 90);
    setForm({
      name: `Operations Manager ${rand}`,
      email: `ops.${rand}@mernexus.com`,
      role: 'admin',
      phone: `+91 99${Math.floor(10000000 + Math.random() * 90000000)}`,
      age: 34,
      address: 'MERNEXUS HQ, Cyber City',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
    });
  };

  const validate = () => {
    if (!form.name.trim()) throw new Error('Name is required');
    if (!form.email.trim()) throw new Error('Email is required');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email)) throw new Error('Please enter a valid email address');
    if (form.age !== '') {
      const age = Number(form.age);
      if (!Number.isInteger(age) || age < 1) throw new Error('Age must be a positive whole number');
    }
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
        email: form.email.trim().toLowerCase(),
        role: form.role || 'customer',
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        ...(form.age !== '' ? { age: Number(form.age) } : {}),
      };
      const response = await createUser(payload);
      setSuccess(`User created successfully with ID: ${response?.data?._id || 'unknown'}`);
      setForm(initialState);
      if (onCreated) onCreated(response?.data);
    } catch (err) {
      setError(err.message || 'Unable to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl sm:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
            Account Registration
          </span>
          <h2 className="mt-1 text-2xl font-bold text-white">Create New User</h2>
          <p className="text-xs text-slate-400">
            Register a new customer account for placing orders or an admin account for managing the platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={applySampleCustomer}
            className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/20"
          >
            ✨ Fill Customer Preset
          </button>
          <button
            type="button"
            onClick={applySampleAdmin}
            className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/20"
          >
            ⚡ Fill Admin Preset
          </button>
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-slate-700 bg-slate-950 px-4 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            Back
          </button>
        </div>
      </div>

      {success ? <AlertMessage type="success" title="Success" message={success} /> : null}
      {error ? <AlertMessage type="error" title="Error" message={error} /> : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Role Selection Segmented Cards */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Select Account Role *
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleSetRole('customer')}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                form.role === 'customer'
                  ? 'border-sky-500 bg-sky-950/30 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-xl text-sky-400">
                🛍️
              </div>
              <div>
                <p className="font-bold text-white">Customer Account</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Can browse products, place orders, provide delivery addresses, and track delivery status.
                </p>
                {form.role === 'customer' && (
                  <span className="mt-2 inline-block text-[11px] font-semibold text-sky-400">
                    ✓ Selected
                  </span>
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSetRole('admin')}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                form.role === 'admin'
                  ? 'border-purple-500 bg-purple-950/30 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-xl text-purple-400">
                🛡️
              </div>
              <div>
                <p className="font-bold text-white">Administrator Account</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Full access: add products with image & custom delivery timelines, manage orders and delivery status.
                </p>
                {form.role === 'admin' && (
                  <span className="mt-2 inline-block text-[11px] font-semibold text-purple-400">
                    ✓ Selected
                  </span>
                )}
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
              <label htmlFor="create-user-name" className="mb-1 block text-xs font-medium text-slate-300">
                Full Name *
              </label>
              <input
                id="create-user-name"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-sky-500"
              />
            </div>

            <div>
              <label htmlFor="create-user-email" className="mb-1 block text-xs font-medium text-slate-300">
                Email Address *
              </label>
              <input
                id="create-user-email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. rahul@example.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-sky-500"
              />
            </div>

            <div>
              <label htmlFor="create-user-phone" className="mb-1 block text-xs font-medium text-slate-300">
                Phone Number (For Order Updates)
              </label>
              <input
                id="create-user-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g. +91 9876543210"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-sky-500"
              />
            </div>

            <div>
              <label htmlFor="create-user-age" className="mb-1 block text-xs font-medium text-slate-300">
                Age
              </label>
              <input
                id="create-user-age"
                name="age"
                type="number"
                min="1"
                value={form.age}
                onChange={handleChange}
                placeholder="e.g. 28"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Shipping / Location Address */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-300">
            Default Delivery Address
          </h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="create-user-address" className="mb-1 block text-xs font-medium text-slate-300">
                Street Address / House No.
              </label>
              <input
                id="create-user-address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="e.g. Flat 402, Lotus Towers, Road No. 3"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-sky-500"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="create-user-city" className="mb-1 block text-xs font-medium text-slate-300">
                  City
                </label>
                <input
                  id="create-user-city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. Hyderabad"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-sky-500"
                />
              </div>

              <div>
                <label htmlFor="create-user-state" className="mb-1 block text-xs font-medium text-slate-300">
                  State
                </label>
                <input
                  id="create-user-state"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="e.g. Telangana"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-sky-500"
                />
              </div>

              <div>
                <label htmlFor="create-user-pincode" className="mb-1 block text-xs font-medium text-slate-300">
                  Pincode
                </label>
                <input
                  id="create-user-pincode"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="e.g. 500081"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-sky-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-slate-700 bg-slate-950 px-6 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-sky-500 px-7 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-sky-500/20 transition hover:bg-sky-400 disabled:opacity-50"
          >
            {loading ? <LoadingSpinner label="Creating user..." /> : 'Create User Account 🚀'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateUserPage;
