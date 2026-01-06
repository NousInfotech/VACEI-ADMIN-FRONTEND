'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Breadcrumb from "@/components/Breadcrumb";
interface User {
  id: number;
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  status?: number;
  companyName: string;
  assignedAccountant: string;
  vatNumber: string;
}

export default function SingleClientView() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const encodedId = searchParams.get('id');
  const userId = encodedId ? atob(encodedId) : null; // decode base64

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      setLoading(true);
      const token = localStorage.getItem('token') || '';

      try {
        const res = await fetch(`${backendUrl}user/${userId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error('User not found');
        const data = await res.json();

        const mappedUser: User = {
          id: data.id,
          clientId: data.clientId || 'N/A',
          firstName: data.first_name || 'N/A',
          lastName: data.last_name || 'N/A',
          email: data.email || 'N/A',
          status: data.status,
          companyName: data.meta?.company_name || 'N/A',
          vatNumber: data.meta?.vat_number || 'N/A',
          assignedAccountant: data.assignedAccountant
            ? `${data.assignedAccountant.first_name || ''} ${data.assignedAccountant.last_name || ''}`.trim() || 'Unassigned'
            : 'Unassigned',
        };

        setUser(mappedUser);
      } catch (err: any) {
        setError(err.message || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, backendUrl]);

  const showValue = (val: string | number | undefined | null) =>
    val || val === 0 ? val : 'N/A';

  if (loading)
    return (
      <section className="w-full px-4 pt-8">
        <h1 className="text-2xl font-semibold mb-6">Client Details</h1>
        <div className="bg-white shadow rounded p-6 space-y-6 border border-gray-200 w-full max-w-3xl mx-auto">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-300 rounded animate-pulse w-3/4" />
          ))}
        </div>
      </section>
    );

  if (error) return <p className="p-6 text-red-500 text-center">{error}</p>;
  if (!user) return <p className="p-6 text-center">Client not found.</p>;

  return (
    <section className="w-full px-4 pt-8 max-w-4xl">
      {/* Breadcrumb */}
     <Breadcrumb />

      {/* Heading */}
      <h1 className="text-3xl font-semibold mb-8 text-gray-900">Client Details</h1>

      {/* Client details table */}
      <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-sm bg-white">
        <table className="min-w-full table-auto divide-y divide-gray-200">
          <tbody className="divide-y divide-gray-200">
            {[
              { label: 'Client ID', value: showValue(user.clientId) },
              { label: 'Full Name', value: showValue(`${user.firstName} ${user.lastName}`.trim()) },
              { label: 'Email', value: showValue(user.email) },
              { label: 'Company Name', value: showValue(user.companyName) },
              { label: 'VAT Number', value: showValue(user.vatNumber) },
              { label: 'Assigned Accountant', value: showValue(user.assignedAccountant) },
              {
                label: 'Status',
                value:
                  user.status === 1
                    ? <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">Active</span>
                    : user.status === 0
                    ? <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold">Inactive</span>
                    : <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">N/A</span>
              },
            ].map(({ label, value }) => (
              <tr key={label} className="hover:bg-gray-50">
                <th
                  scope="row"
                  className="text-left px-6 py-4 font-medium text-gray-700 whitespace-nowrap"
                >
                  {label}
                </th>
                <td className="px-6 py-4 text-gray-900">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
