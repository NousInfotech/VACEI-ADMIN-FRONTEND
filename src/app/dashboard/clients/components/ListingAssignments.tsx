'use client';

import { useEffect, useState } from 'react';
import { Edit3 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import FilterableTable from '@/components/FilterableTable';
import { Edit03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
const SkeletonRow = () => (
  <tr className="border-b border-gray-300 animate-pulse bg-gray-50">
    {[64, 64, 64, 96, 96, 48].map((w, i) => (
      <td key={i} className="p-3 px-6">
        <div className="h-5 bg-gray-300 rounded-md" style={{ width: `${w}px` }}></div>
      </td>
    ))}
  </tr>
);

interface Assignment {
  id: number;
  client: {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
  };
  accountant: {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
  };
  assignedAt: string;
  services: any;
}

interface Service {
  id: number;
  serviceCode: string;
  name: string;
}

export default function ListingAssignments({ refreshKey }: { refreshKey: number }) {
  const searchParams = useSearchParams();
  const encodedId = searchParams.get('id');
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const pageSize = 10;

  // userId decoding
  let userId: string | null = null;
  try {
    userId = encodedId ? atob(encodedId) : null;
  } catch {
    userId = null;
  }

  const [allServices, setAllServices] = useState<Service[]>([]);
const [selectedService, setSelectedService] = useState<string>("");

  // Fetch services for dropdown
  const fetchServices = async (): Promise<Service[]> => {
    const token = localStorage.getItem('token') || '';
    try {
      const res = await fetch(`${backendUrl}services`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch services');
      return await res.json();
    } catch {
      return [];
    }
  };

  useEffect(() => {
    fetchServices().then(setAllServices);
  }, []);

  // Reset page to 1 when service filter changes
  useEffect(() => {
    setPage(1);
  }, [selectedService]);

  const fetchAssignments = async () => {
    setLoading(true);
    const token = localStorage.getItem('token') || '';
    try {
      const params = new URLSearchParams({
        search,
        clientId: userId || '',
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortField,
        sortOrder,
      });

      if (selectedService !== '' && selectedService !== null) {
        // Here we need to send serviceCode or id? The select values are serviceCode (string) in your code,
        // but selectedService state is number | ''. So align the types correctly.
        // Let's switch select value to serviceCode string to be consistent.
        params.append('service', selectedService.toString());
      }

      const res = await fetch(`${backendUrl}accountant-assignment?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to fetch assignments');

      const data = await res.json();
      setAssignments(data.assignments || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      setAssignments([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page, sortField, sortOrder, selectedService]);

  useEffect(() => {
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  return (
    <>
   

      <FilterableTable
        loading={loading}
         filters={
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by client or accountant name/email"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-72 border border-gray-300 p-3 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedService}
              onChange={e => {
                setSelectedService(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-64 border border-gray-300 p-3 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Filter by service</option>
              {allServices.map(service => (
                <option key={service.serviceCode} value={service.serviceCode}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
        }
        columns={[
          {
            key: 'client',
            label: 'Client',
            sortable: true,
            render: (_: any, row: Assignment) => (
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 truncate max-w-[180px]">{row.client.username}</span>
                <span className="text-xs text-gray-500 truncate max-w-[180px]">{row.client.email}</span>
              </div>
            ),
          },
          {
            key: 'accountant',
            label: 'Accountant',
            sortable: true,
            render: (_: any, row: Assignment) => (
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 truncate max-w-[180px]">{row.accountant.username}</span>
                <span className="text-xs text-gray-500 truncate max-w-[180px]">{row.accountant.email}</span>
              </div>
            ),
          },
          {
            key: 'assignedAt',
            label: 'Assigned At',
            sortable: true,
            render: (value: string) => (
              <time
                dateTime={value}
                className="text-gray-700 text-sm"
                title={new Date(value).toLocaleString()}
              >
                {new Date(value).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </time>
            ),
          },
          {
            key: 'services',
            label: 'Services',
            render: (value: any) => (
              <pre className="max-w-xs break-words text-xs text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(value, null, 2)}
              </pre>
            ),
          },
        ]}
        data={assignments}
        actionsForRow={row => [
          {
            title: 'Edit',
            icon:  <HugeiconsIcon icon={Edit03Icon}  className="w-5 h-5"  />,
            color: 'bg-blue-600 hover:bg-blue-700',
            href: `/dashboard/clients/assign-accountants?id=${encodedId}&aid=${btoa(row.id.toString())}`,
          },
        ]}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
        }}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        noDataText="No assignments found."
        SkeletonRow={SkeletonRow}
      />
    </>
  );
}
