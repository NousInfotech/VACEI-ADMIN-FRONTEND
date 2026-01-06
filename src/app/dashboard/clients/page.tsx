'use client'; // This page is a client component

import { Suspense } from 'react';
import UserList from './components/UserList'; // Assuming UserList is in the same directory or correctly imported


export default function ClientsPage() {
  return (
    // Wrap UserList with Suspense
    <Suspense fallback={<div>Loading please wait...</div>}>
      <UserList />
    </Suspense>
  );
}