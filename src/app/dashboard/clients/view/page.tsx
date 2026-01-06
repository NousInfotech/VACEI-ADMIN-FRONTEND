import { Suspense } from 'react';
import SingleClientView from '../components/SingleClientView';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading client details...</div>}>
      <SingleClientView />
    </Suspense>
  );
}
