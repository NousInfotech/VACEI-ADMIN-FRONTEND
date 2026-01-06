'use client';
import React, { useState, useEffect } from 'react';
import TextInput from '@/components/TextInput';
import AlertMessage from '@/components/AlertMessage';
import { fetchUser, saveUser, FormDataType } from '@/api/user';
import { useRouter } from "next/navigation";
const CreateUserPage: React.FC = () => {
    const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormDataType>({
    company_name: '',
    vat_number: '',
    contact_person: '',
    email: '',
    username: '',
    password: '',
    phone: '',
    role: 3,
    status: 1,
    accountant_id: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState<'success' | 'danger'>('success');
  const [loadingUser, setLoadingUser] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const encodedId = params.get('id');
    if (!encodedId) return;
    try {
      setUserId(atob(encodedId));
    } catch {
      setUserId(null);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    const loadUser = async () => {
      setLoadingUser(true);
      try {
        const data = await fetchUser(userId);
        setFormData(data);
      } catch (error) {
        console.error(error);
        setMessage('Failed to load user data.');
        setAlertVariant('danger');
      } finally {
        setLoadingUser(false);
      }
    };
    loadUser();
  }, [userId]);

  const handleChange = (field: keyof FormDataType, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{7,15}$/;

    if (!formData.company_name) newErrors.company_name = 'Company name is required.';
    if (!formData.vat_number) newErrors.vat_number = 'VAT number is required.';
    if (!formData.contact_person) newErrors.contact_person = 'Contact person is required.';
    if (!formData.email) newErrors.email = 'Email is required.';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format.';
    if (!formData.username) newErrors.username = 'Username is required.';
    if (!userId) {
      if (!formData.password) newErrors.password = 'Password is required.';
      else if (formData.password.length < 7) newErrors.password = 'Password must be at least 7 characters.';
    }
    if (!formData.phone) newErrors.phone = 'Phone number is required.';
    else if (!phoneRegex.test(formData.phone)) newErrors.phone = 'Invalid phone number format.';

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setAlertVariant('danger');
      setMessage('Please fix the validation errors.');
      return;
    }

    setSaving(true);
    try {
      const resultMessage = await saveUser(userId, formData);
      setMessage(resultMessage);
     setTimeout(() => {
          router.push('/dashboard/clients');
        }, 2000); 
      setAlertVariant('success');
      if (!userId) {
        setFormData({
          company_name: '',
          vat_number: '',
          contact_person: '',
          email: '',
          username: '',
          password: '',
          phone: '',
          role: 3,
          status: 1,
          accountant_id: '',
        });
        setErrors({});
      }
    } catch (error: any) {
      setMessage(error.message || 'An error occurred');
      setAlertVariant('danger');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-medium pb-5 border-b border-gray-200">{userId ? 'Edit Client' : 'Create Client'}</h1>
    <div className="mt-5">
    

      {message && (
        <AlertMessage message={message} variant={alertVariant} onClose={() => setMessage('')} duration={6000} />
      )}

      {loadingUser ? (
        <div>Loading...</div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full space-y-8 mx-auto">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TextInput
              label="Company Name"
              type="text"
              value={formData.company_name}
              onChange={(val) => handleChange('company_name', val)}
              placeholder="Company Name"
              error={errors.company_name}
              className="bg-gray-50"
            />
            <TextInput
              label="VAT Number"
              type="text"
              value={formData.vat_number}
              onChange={(val) => handleChange('vat_number', val)}
              placeholder="VAT Number"
              error={errors.vat_number}
              className="bg-gray-50"
            />
            <TextInput
              label="Contact Person"
              type="text"
              value={formData.contact_person}
              onChange={(val) => handleChange('contact_person', val)}
              placeholder="Contact Person"
              error={errors.contact_person}
              className="bg-gray-50"
            />
            <TextInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(val) => handleChange('email', val)}
              placeholder="Email"
              error={errors.email}
              className="bg-gray-50"
            />
            <TextInput
              label="Username"
              type="text"
              value={formData.username}
              onChange={(val) => handleChange('username', val)}
              placeholder="Username"
              error={errors.username}
              className="bg-gray-50"
            />
            <TextInput
              label="Password"
              type="password"
              value={formData.password || ''}
              onChange={(val) => handleChange('password', val)}
              placeholder={userId ? "Leave blank to keep current password" : "Enter a secure password"}
              error={errors.password}
              className="bg-gray-50"
            />
            <TextInput
              label="Phone Number"
              value={formData.phone}
              onChange={(val) => {
                let filteredVal = val;
                if (filteredVal.length === 1 && filteredVal !== '+') filteredVal = filteredVal.replace(/\D/g, '');
                else filteredVal = filteredVal.replace(/[^\d+]/g, '');
                handleChange('phone', filteredVal);
              }}
              placeholder="Phone Number"
              error={errors.phone}
              className="bg-gray-50"
            />

            {/* Status select */}
            <div className="flex flex-col">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Status
              </label>
              <select
                className={`rounded border px-3 py-2 focus:outline-none focus:ring-2 transition-all duration-150 ${
                  errors.status
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                } bg-gray-50`}
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
              {errors.status && (
                <p className="text-sm text-red-500 mt-1">{errors.status}</p>
              )}
            </div>
          </div>

          <div className="col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-md disabled:opacity-60"
            >
              {saving
                ? userId
                  ? 'Updating...'
                  : 'Creating...'
                : userId
                ? 'Update'
                : 'Create'}
            </button>
          </div>
        </form>
      )}
      </div>
    </>
  );
};

export default CreateUserPage;
