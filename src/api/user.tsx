// @/api/user.ts

export interface FormDataType {
  company_name: string;
  vat_number: string;
  contact_person: string;
  email: string;
  username: string;
  password?: string;
  phone: string;
  role: number;
  status: number;
  accountant_id: string;
}

export interface UserData {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: number;
  status: number;
  accountant_id?: string;
  assignedAccountant?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  meta?: {
    company_name?: string;
    vat_number?: string;
    contact_person?: string;
  };
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function fetchUser(userId: string): Promise<FormDataType> {
  const token = getToken();
  if (!token) throw new Error('Token not found');

  const res = await fetch(`${backendUrl}user/${userId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) throw new Error('User not found');
  const data = await res.json();

  return {
    company_name: data.meta?.company_name || '',
    vat_number: data.meta?.vat_number || '',
    contact_person: data.meta?.contact_person || '',
    email: data.email || '',
    username: data.username || '',
    password: '',
    phone: data.phone || '',
    role: data.role || 3,
    status: data.status,
    accountant_id: data.accountant_id || data.assignedAccountant?.id || '',
  };
}

export async function saveUser(userId: string | null, formData: FormDataType): Promise<string> {
  const token = getToken();
  if (!token) throw new Error('Token not found');

  const method = userId ? 'PUT' : 'POST';
  const url = userId ? `${backendUrl}user/update/${userId}` : `${backendUrl}user/create`;

  const bodyData = { ...formData };
  if (userId && !bodyData.password) {
    delete bodyData.password;
  }

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
    throw new Error(data.message || `Failed to ${userId ? 'update' : 'create'} user`);
  }

  return data.message || `User ${userId ? 'updated' : 'created'} successfully!`;
}
