'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Edit3, UserPlus, Trash2, CheckCircle, XCircle, Eye } from 'lucide-react';
import FilterableTable from "@/components/FilterableTable";
import Breadcrumb from "@/components/Breadcrumb";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit03Icon, UserIcon,Delete02Icon,Cancel01Icon,Tick01Icon,AssignmentsIcon } from "@hugeicons/core-free-icons";
const SkeletonRow = () => (
  <tr className="border-b border-gray-300 animate-pulse">
    {[48, 64, 48, 40, 96, 48].map((w, i) => (
      <td key={i} className="p-3 px-8">
        <div className="h-4 bg-gray-300 rounded" style={{ width: `${w}px` }}></div>
      </td>
    ))}
  </tr>
);

const SkeletonFilter = () => (
  <div className="animate-pulse grid md:grid-cols-2 gap-4 mb-4">
    {[1, 2].map((_, i) => (
      <div key={i} className="h-10 bg-gray-300 rounded w-full"></div>
    ))}
  </div>
);

const ActionButton = ({
  href,
  icon,
  title,
  color,
  onClick,
}: {
  href?: string;
  icon: React.ReactNode;
  title: string;
  color: string;
  onClick?: () => void;
}) => {
  const button = (
    <button
      className={`w-6 h-6 text-white ${color} rounded-full text-sm flex items-center justify-center cursor-pointer`}
      title={title}
      onClick={onClick}
      type="button"
    >
      {icon}
    </button>
  );
  return href ? <Link href={href}>{button}</Link> : button;
};

interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  status: number;
  email: string;
  role: number;
  assignedClientsCount: number;
  deleted?: boolean;
}

export default function UserList() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [accountantStatus, setAccountantStatus] = useState('');
  const pageSize = 10;

  const handleSort = (field: string) => {
    if (field === sortBy) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  // Soft delete accountant
  const deleteAccountant = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this accountant?')) return;
    const token = localStorage.getItem('token') || '';
    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}user/delete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userId }),
      });
      if (!res.ok) throw new Error('Failed to delete accountant');
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      alert('Failed to delete accountant');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle active/inactive status
  const toggleStatus = async (userId: number, currentStatus?: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;

    if (newStatus === 0) {
      const confirmInactive = confirm(
        'Are you sure you want to set this user status to Inactive?'
      );
      if (!confirmInactive) return;
    }

    const token = localStorage.getItem('token') || '';
    try {
      const res = await fetch(`${backendUrl}user/updateStatus`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Status update failed');
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
    } catch (err) {
      alert('Failed to update status');
      console.error(err);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const token = localStorage.getItem('token') || '';

      try {
        const params = new URLSearchParams({
          role: '2',
          search,
          status: accountantStatus,
          page: page.toString(),
          pageSize: pageSize.toString(),
          sortBy,
          sortOrder,
        });

        const res = await fetch(`${backendUrl}user/getAccountants?${params}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error('Failed to fetch users');

        const data = await res.json();
        setUsers(data.accountants || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error(err);
        setUsers([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    })();
  }, [search, page, sortBy, sortOrder, accountantStatus]);

  const sortIndicator = (field: string) =>
    sortBy === field ? (sortOrder === 'asc' ? '↑' : '↓') : '';

  return (
    <section className="mx-auto max-w-[1400px] px-[15px] w-full pt-8">
      <Breadcrumb />
        <div className="bg-white border border-gray-200 rounded-[10px] px-5 py-6 overflow-hidden">
       <h1 className="text-2xl font-medium pb-5 border-b border-gray-200">Accountants</h1>
      <FilterableTable
      loading={loading}
      initialLoading={initialLoading}
      filters={
        <>
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-medium">Filter Accountants</div>
        </div>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <input
          type="text"
          placeholder="Search by Accountant Name , Username or email"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-64 border p-2 text-sm border-gray-300 rounded"
          />
          <select
          value={accountantStatus}
          onChange={(e) => {
            setAccountantStatus(e.target.value);
            setPage(1);
          }}
          className="border p-2 text-sm border-gray-300 rounded"
          >
          <option value="">Status</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
          </select>
         
        </div>
        </>
      }
      columns={[
        {
        key: 'first_name',
        label: 'ACCOUNTANT NAME',
        sortable: true,
        render: (value: string, row: User) => `${row.first_name} ${row.last_name}`,
        },
        {
        key: 'username',
        label: 'USERNAME',
        sortable: true,
        },
        {
        key: 'email',
        label: 'EMAIL',
        sortable: true,
        },
        {
        key: 'clientCount',
        label: 'ASSIGNED CLIENTS',
        sortable: true,
        render: (value: number) => value || 0,
        },
        {
        key: 'status',
        label: 'STATUS',
        sortable: true,
        render: (value: number) => (value === 1 ? 'Active' : 'Inactive'),
        },
      ]}
      data={users}
      actionsForRow={(user: User) => [
        {
        href: `/dashboard/accountants/update?id=${btoa(user.id.toString())}`,
        icon:   <HugeiconsIcon icon={Edit03Icon}  className="w-5 h-5"  />,
        title: 'Edit',
        color: 'bg-blue-600 hover:bg-blue-700',
        },
        {
        href: `/dashboard/accountants/assign-clients?id=${btoa(user.id.toString())}`,
        icon: <HugeiconsIcon icon={AssignmentsIcon}  className="w-5 h-5"  />,
        title: 'Assign Clients',
        color: 'bg-yellow-600 hover:bg-yellow-700',
        },
        {
        icon: <HugeiconsIcon icon={Delete02Icon}  className="w-5 h-5"  />,
        title: 'Delete',
        color: 'bg-red-700 hover:bg-red-800',
        onClick: () => deleteAccountant(user.id),
        },
        {
        icon: user.status === 1 ? <HugeiconsIcon icon={Cancel01Icon}  className="w-5 h-5"  /> : <HugeiconsIcon icon={Tick01Icon}  className="w-5 h-5"  />,
        title: user.status === 1 ? 'Set Inactive' : 'Set Active',
        color:
          user.status === 1
          ? 'bg-red-600 hover:bg-red-700'
          : 'bg-green-600 hover:bg-green-700',
        onClick: () => toggleStatus(user.id, user.status),
        },
      ]}
      sortField={sortBy}
      sortOrder={sortOrder}
      onSort={handleSort}
      pagination={{
        page,
        totalPages,
        onPageChange: setPage,
      }}
      noDataText="No accountants found."
      SkeletonRow={SkeletonRow}
      />
      </div>
    </section>
  );
}