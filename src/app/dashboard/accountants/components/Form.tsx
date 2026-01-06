'use client';
import React, { useState, useEffect } from 'react';
import TextInput from '@/components/TextInput';
import { useAlert } from "@/app/context/AlertContext";
import { useRouter } from "next/navigation";

// No need for SkeletonInput here if we're not replacing the whole form
// const SkeletonInput = () => (
//   <div className="h-10 rounded bg-gray-200 animate-pulse w-full mb-4" />
// );

type Service = {
  serviceCode: string;
  id: number;
  name: string;
};

const CreateAccountantPage: React.FC = () => {
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const { setAlert } = useAlert();

  const [userId, setUserId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [saving, setSaving] = useState(false); // This will now disable inputs
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<{
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    password?: string;
    role: number;
    services: string[];
    status: 'active' | 'inactive';
  }>({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    role: 2,
    services: [],
    status: 'active',
  });

  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const encodedId = params.get('id');
    if (!encodedId) return;
    try {
      const decodedId = atob(encodedId);
      setUserId(decodedId);
    } catch {
      setUserId(null);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const res = await fetch(`${backendUrl}services`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error('Failed to fetch services');
        const data = await res.json();
        setServices(data || []);
      } catch (error) {
        setAlert({ variant: 'danger', message: 'Failed to load services.' });
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, [backendUrl, token, setAlert]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      services: selectedServices,
    }));
  }, [selectedServices]);

  useEffect(() => {
    if (!userId || !token) return;

    const fetchUser = async () => {
      setLoadingUser(true);
      try {
        const res = await fetch(`${backendUrl}user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error('User not found');
        const data = await res.json();

        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          username: data.username || '',
          email: data.email || '',
          password: '',
          role: 2,
          services: data.services || [],
          status: data.status === 0 ? 'inactive' : 'active',
        });

        setSelectedServices(data.services || []);
      } catch (error) {
        console.error('Failed to load user', error);
        setAlert({ variant: 'danger', message: 'Failed to load user data.' });
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [userId, backendUrl, token, setAlert]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.first_name) newErrors.first_name = 'First name is required.';
    if (!formData.last_name) newErrors.last_name = 'Last name is required.';
    if (!formData.username) newErrors.username = 'Username is required.';
    if (!formData.email) newErrors.email = 'Email is required.';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email.';
    if (!userId) {
      if (!formData.password) newErrors.password = 'Password is required.';
      else if (formData.password.length < 7) newErrors.password = 'Minimum 7 characters required.';
    }
    if (!selectedServices.length) newErrors.services = 'Select at least one service.';

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setAlert({ variant: 'danger', message: 'Please fix the errors below.' });
      return;
    }

    setSaving(true); // Set saving to true
    try {
      const method = userId ? 'PUT' : 'POST';
      const url = userId
        ? `${backendUrl}user/accountant/update/${userId}`
        : `${backendUrl}user/accountant/create`;

      const bodyData = {
        ...formData,
        status: formData.status === 'inactive' ? 0 : 1,
      };

      if (userId && !bodyData.password) delete bodyData.password;

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({ variant: 'danger', message: data.message || 'Failed to save user.' });
        return;
      }

      setAlert({ variant: 'success', message: data.message || 'User saved successfully.' });
      setTimeout(() => {
        router.push('/dashboard/accountants');
      }, 2000); // 2000 milliseconds = 2 seconds

      // Only clear form if it's a new user and we're not redirecting immediately
      // If you are always redirecting, this block is not strictly necessary
      if (!userId) {
        setFormData({
          first_name: '',
          last_name: '',
          username: '',
          email: '',
          password: '',
          role: 2,
          services: [],
          status: 'active',
        });
        setSelectedServices([]);
        setErrors({});
      }
    } catch (err) {
      setAlert({ variant: 'danger', message: 'Server error.' });
    } finally {
      // Don't set saving to false immediately if you have a timeout redirect
      // It will become false implicitly when the component unmounts for the redirect
      // If you weren't redirecting, you would set it back to false here.
    }
  };

  // Determine if inputs should be disabled
  const disableInputs = loadingUser || saving;

  return (
    <>
      <h1 className="text-2xl font-medium pb-5 border-b border-gray-200">
        {userId ? 'Edit Accountant' : 'Create Accountant'}
      </h1>
      <div className=" bg-white rounded-2xl border border-gray-100 mt-5 p-6"> {/* Added padding here */}
        {loadingUser ? ( // Still use skeleton for initial user data loading
          <form className="grid grid-cols-2 gap-6" aria-busy="true">
            <div className="h-10 rounded bg-gray-200 animate-pulse w-full mb-4" />
            <div className="h-10 rounded bg-gray-200 animate-pulse w-full mb-4" />
            <div className="h-10 rounded bg-gray-200 animate-pulse w-full mb-4" />
            <div className="h-10 rounded bg-gray-200 animate-pulse w-full mb-4" />
            <div className="h-10 rounded bg-gray-200 animate-pulse w-full mb-4" />
            <div className="h-10 rounded bg-gray-200 animate-pulse w-full mb-4" />
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInput
              label="First Name"
              type="text"
              value={formData.first_name}
              onChange={(val) => handleChange('first_name', val)}
              placeholder="First Name"
              error={errors.first_name}
              className="mb-2"
             
            />
            <TextInput
              label="Last Name"
              type="text"
              value={formData.last_name}
              onChange={(val) => handleChange('last_name', val)}
              placeholder="Last Name"
              error={errors.last_name}
              className="mb-2"
           
            />
            <TextInput
              label="Username"
              type="text"
              value={formData.username}
              onChange={(val) => handleChange('username', val)}
              placeholder="Username"
              error={errors.username}
              className="mb-2"
             
            />
            <TextInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(val) => handleChange('email', val)}
              placeholder="Email"
              error={errors.email}
              className="mb-2"
             
            />
            <TextInput
              label="Password"
              type="password"
              value={formData.password ?? ''}
              onChange={(val) => handleChange('password', val)}
              placeholder={userId ? 'Leave blank to keep current' : 'Enter a secure password'}
              error={errors.password}
              className="mb-2"
            
            />

            <div>
              <label className="block mb-2 font-medium text-gray-700">Status</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                disabled={disableInputs} // Disable select when saving
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block mb-2 font-medium text-gray-700">Services</label>
              {loadingServices ? (
                // Use a skeleton for services loading if needed, but not tied to `saving`
                <div className="h-10 rounded bg-gray-200 animate-pulse w-full mb-4" />
              ) : services.length === 0 ? (
                <div className="text-gray-500 text-sm">No services available.</div>
              ) : (
                <div className="relative">
                  <select
                    multiple
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
                    value={selectedServices}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
                      setSelectedServices(selected);
                    }}
                    size={Math.min(services.length, 8)}
                    disabled={disableInputs} // Disable select when saving
                  >
                    {services.map((service) => (
                      <option key={service.serviceCode} value={service.serviceCode}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-3 pointer-events-none text-gray-400">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
              )}
              {errors.services && (
                <div className="text-red-500 text-sm mt-1">{errors.services}</div>
              )}
            </div>
            <div className="col-span-2 flex justify-end mt-4">
              <button
                type="submit"
                disabled={disableInputs} // Use disableInputs for the button
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-md disabled:opacity-60"
              >
                {saving && ( // Only show spinner if actually saving
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                )}
                {saving ? (userId ? 'Updating...' : 'Creating...') : userId ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default CreateAccountantPage;