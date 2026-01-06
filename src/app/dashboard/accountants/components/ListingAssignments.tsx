'use client';

import { useEffect, useState } from 'react';
import { Edit3 } from 'lucide-react';
import { useSearchParams } from "next/navigation";
import FilterableTable from "@/components/FilterableTable";
import { Edit03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
const SkeletonRow = () => (
  <tr className="border-b border-gray-300 animate-pulse">
    {[64, 64, 64, 96, 96, 48].map((w, i) => (
      <td key={i} className="p-3 px-6">
        <div className="h-5 bg-gray-300 rounded-md" style={{ width: `${w}px` }}></div>
      </td>
    ))}
  </tr>
);
interface Service {
  serviceCode: string;
  name: string;
}

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

export default function ListingAssignments({ refreshKey }: { refreshKey: number }) {
  let userId: string | null = null;
  const searchParams = useSearchParams();
  const encodedId = searchParams.get("id");
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const pageSize = 10;

  try {
    userId = encodedId ? atob(encodedId) : null;
  } catch {
    userId = null;
  }

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
      return await res.json(); // assume it returns array of Service objects
    } catch (err) {
      return [];
    }
  };

  const fetchAssignments = async () => {
    setLoading(true);
    const token = localStorage.getItem('token') || '';
    try {
      const params = new URLSearchParams({
        search: search,
        service: selectedService,
        accountantId: userId || '',
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortField,
        sortOrder,
      });

      const res = await fetch(`${backendUrl}accountant-assignment?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to fetch assignments');
      const data = await res.json();
      setAssignments(data.assignments || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setAssignments([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [search, selectedService, page, sortField, sortOrder]);

  useEffect(() => {
    fetchAssignments();
  }, [refreshKey]);

  useEffect(() => {
    const loadServices = async () => {
      const services = await fetchServices();
      setAllServices(services);
    };
    loadServices();
  }, []);

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
              <div>
                <div className="font-semibold text-gray-900">{row.client.username}</div>
                <div className="text-xs text-gray-500 truncate max-w-[180px]">{row.client.email}</div>
              </div>
            ),
          },
          {
            key: 'accountant',
            label: 'Accountant',
            sortable: true,
            render: (_: any, row: Assignment) => (
              <div>
                <div className="font-semibold text-gray-900">{row.accountant.username}</div>
                <div className="text-xs text-gray-500 truncate max-w-[180px]">{row.accountant.email}</div>
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
                {new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
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
            title: "Edit",
            icon:   <HugeiconsIcon icon={Edit03Icon}  className="w-5 h-5"  />,
            color: "bg-blue-600 hover:bg-blue-700",
            href: `/dashboard/accountants/assign-clients?id=${encodedId}&aid=${btoa(row.id.toString())}`,
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
