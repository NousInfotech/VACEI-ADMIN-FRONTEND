'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit03Icon, UserIcon, Delete02Icon, Cancel01Icon, Tick01Icon, AssignmentsIcon, Logout03Icon } from "@hugeicons/core-free-icons";
import Link from 'next/link';
import FilterableTable from "@/components/FilterableTable";
import Breadcrumb from "@/components/Breadcrumb";
import AlertMessage from '@/components/AlertMessage';

// --- Modal Component ---
interface ModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

const Modal = ({
  isOpen,
  title,
  description,
  onCancel,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full animate-fadeIn">
        {/* Header */}
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        {/* Body */}
        <p className="text-gray-600 mb-5">{description}</p>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};


// --- Skeleton Rows for Table ---
const SkeletonRow = ({ columnsCount = 6 }) => (
  <tr className="border-b border-gray-300">
    {Array.from({ length: columnsCount }).map((_, i) => (
      <td key={i} className="p-3 px-8">
        <div className="h-4 bg-gray-300 rounded animate-pulse w-full mt-1"></div>
      </td>
    ))}
  </tr>
);
interface User {
  id: number;
  clientId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  status?: number;
  companyName: string;
  assignedAccountant: string;
  vatNumber: string;
  hasQuickBooksToken?: boolean;
}

export default function UserList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const pageSize = 10;
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [modalAction, setModalAction] = useState<(() => void) | null>(null);

  // Alert state
  const [message, setMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState<'success' | 'danger'>('success');

  useEffect(() => {
    const successMessage = searchParams.get('success');
    const errorMessage = searchParams.get('error');
    if (successMessage || errorMessage) {
      setMessage(successMessage || errorMessage || '');
      setAlertVariant(successMessage ? 'success' : 'danger');
      const cleanUrl = window.location.pathname;
      window.history.replaceState(null, '', cleanUrl);
    }
  }, [searchParams]);

  const handleSort = (field: string) => {
    if (sortField === field) setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  // --- Modal helpers ---
  const openRevokeModal = (userId: number, username: string) => {
    setModalTitle('Revoke QuickBooks Access');
    setModalDesc(`This will revoke QuickBooks for ${username} and delete all related data. Are you sure?`);
    setModalAction(() => () => revokeQuickBooks(userId));
    setModalOpen(true);
  };

  const openDeleteModal = (userId: number) => {
    setModalTitle('Delete User');
    setModalDesc(`Are you sure you want to delete this client? This action cannot be undone.`);
    setModalAction(() => () => deleteUser(userId));
    setModalOpen(true);
  };

  const openAssignmentModal = (userId: number, username: string, email: string) => {
    setModalTitle('QuickBooks Assignment');
    setModalDesc(`Authenticate QuickBooks for ${username} (${email})? Make sure to sign out of all logged-in QuickBooks sessions before authenticating a new client.`);
    setModalAction(() => () => router.push(`${backendUrl}quickbooks?clientId=${userId}`));
    setModalOpen(true);
  };

  // --- Action functions ---
  const revokeQuickBooks = async (userId: number) => {
    setModalOpen(false);
    setLoading(true);
    const token = localStorage.getItem('token') || '';
    try {
      const res = await fetch(`${backendUrl}quickbooks/revoke?clientId=${userId}`, {
        method: 'get',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Revoke failed');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, hasQuickBooksToken: false } : u));
      setMessage('QuickBooks token revoked successfully.');
      setAlertVariant('success');
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error(err);
      setMessage('Failed to revoke QuickBooks token.');
      setAlertVariant('danger');
    }
  };

  const deleteUser = async (userId: number) => {
    setModalOpen(false);
    const token = localStorage.getItem('token') || '';
    try {
      const res = await fetch(`${backendUrl}user/delete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId }),
      });
      if (!res.ok) throw new Error('Delete failed');
      setUsers(prev => prev.filter(u => u.id !== userId));
      setMessage('User deleted successfully.');
      setAlertVariant('success');
    } catch (err) {
      console.error(err);
      setMessage('Failed to delete user.');
      setAlertVariant('danger');
    }
  };

  const updateUserStatus = async (userId: number, currentStatus?: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const token = localStorage.getItem('token') || '';
    try {
      const res = await fetch(`${backendUrl}user/updateStatus`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Status update failed');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      console.error(err);
      setMessage('Failed to update status.');
      setAlertVariant('danger');
    }
  };

  // --- Fetch users effect ---
  useEffect(() => {
    (async () => {
      setLoading(true);
      const token = localStorage.getItem('token') || '';
      try {
        const params = new URLSearchParams({
          search, status, page: page.toString(), pageSize: pageSize.toString(),
          sortField, sortOrder,
        });
        const res = await fetch(`${backendUrl}user/getClients?role=3&${params}`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        setUsers(data.users || []);
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
  }, [search, status, page, sortField, sortOrder]);

  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5">
      <Breadcrumb />
      <div className="bg-white border border-gray-200 rounded-[10px] px-5 py-6 overflow-hidden">
        <h1 className="text-2xl font-medium pb-5 border-b border-gray-200">Clients</h1>

        {message && <AlertMessage message={message} variant={alertVariant} onClose={() => setMessage('')} duration={6000} />}

        <FilterableTable
          loading={loading}
          initialLoading={initialLoading}
          filters={
            <>
              <div className="mb-6">
                <div className="text-lg font-medium mb-2">Filter Clients</div>
                <div className="flex items-start gap-2 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm rounded px-4 py-2">
                  {/* Warning Icon */}
                  <svg
                    className="w-4 h-4 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.366-.756 1.41-.756 1.776 0l6.518 13.428c.343.708-.166 1.573-.888 1.573H2.627c-.722 0-1.231-.865-.888-1.573L8.257 3.1zM11 14a1 1 0 11-2 0 1 1 0 012 0zm-1-3a1 1 0 00-.993.883L9 12v1a1 1 0 001.993.117L11 13v-1a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    Make sure to <strong>sign out</strong> of all logged-in QuickBooks sessions before authenticating a new client. Remaining sessions may cause authentication issues.{' '}
                    <a
                      href="https://developer.intuit.com/app/developer/qbo/docs/get-started"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      Sign out from here
                    </a>
                    .
                  </span>
                </div>
                <div className="flex items-start gap-2 bg-red-50 border-l-4 border-red-400 text-red-800 text-sm rounded px-4 py-2 mt-2">
                  <svg
                    className="w-4 h-4 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.366-.756 1.41-.756 1.776 0l6.518 13.428c.343.708-.166 1.573-.888 1.573H2.627c-.722 0-1.231-.865-.888-1.573L8.257 3.1zM11 14a1 1 0 11-2 0 1 1 0 012 0zm-1-3a1 1 0 00-.993.883L9 12v1a1 1 0 001.993.117L11 13v-1a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    Once a QuickBooks account is <strong>assigned</strong>, you must revoke access using the{" "}
                    <HugeiconsIcon icon={Logout03Icon} className="w-4 h-4 inline text-red-600" />{" "}
                    icon before reassigning a new QuickBooks account. This will{" "}
                    <strong>remove all associated data</strong>.
                  </span>

                </div>
              </div>


              <div className="flex flex-wrap items-center gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Search by Client Id, Company, Email, VAT Number"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-64 border p-2 text-sm border-gray-300 rounded"
                />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="border p-2 text-sm border-gray-300 rounded"
                >
                  <option value="">Status</option>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>
            </>




          }
          data={users}
          columns={[
            { key: 'clientId', label: 'CLIENT ID', sortable: true },
            { key: 'companyName', label: 'COMPANY NAME', sortable: true },
            { key: 'vatNumber', label: 'VAT NUMBER', sortable: true },
            { key: 'status', label: 'STATUS', sortable: true, render: (value) => value === 1 ? 'Active' : 'Inactive' },
            { key: 'assignedAccountant', label: 'ASSIGNED ACCOUNTANT' },
          ]}
          actionsForRow={(user) => [
            { href: `/dashboard/clients/update?id=${btoa(user.id.toString())}`, icon: <HugeiconsIcon icon={Edit03Icon} className="w-5 h-5" />, title: 'Edit', color: '' },
            { href: `/dashboard/clients/assign-accountants?id=${btoa(user.id.toString())}`, icon: <HugeiconsIcon icon={UserIcon} className="w-5 h-5" />, title: 'Assignment', color: '' },
            user.hasQuickBooksToken
              ? { icon: <HugeiconsIcon icon={Logout03Icon} className="w-5 h-5" />, title: 'Revoke QuickBooks', color: 'text-red-700 hover:text-red-800', onClick: () => openRevokeModal(user.id, user.username) }
              : { icon: <HugeiconsIcon icon={AssignmentsIcon} className="w-5 h-5" />, title: 'QuickBooks Assignment', color: 'text-green-800 hover:text-green-900', onClick: () => openAssignmentModal(user.id, user.username, user.email) },
            { icon: <HugeiconsIcon icon={Delete02Icon} className="w-5 h-5" />, title: 'Delete', color: '', onClick: () => openDeleteModal(user.id) },
            { icon: user.status === 1 ? <HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5" /> : <HugeiconsIcon icon={Tick01Icon} className="w-5 h-5" />, title: user.status === 1 ? 'Set Inactive' : 'Set Active', color: user.status === 1 ? '' : '', onClick: () => updateUserStatus(user.id, user.status) },
          ]}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          pagination={{ page, totalPages, onPageChange: setPage }}
          noDataText="No users found."
          SkeletonRow={SkeletonRow}
        />

        {/* Modal */}
        <Modal
          isOpen={modalOpen}
          title={modalTitle}
          description={modalDesc}
          onCancel={() => setModalOpen(false)}
          onConfirm={modalAction || (() => { })}
        />
      </div>
    </section>
  );
}
