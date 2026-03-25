import { Suspense } from 'react';
import CheckoutForm from './CheckoutForm';

export default function Home() {
  return (
    <Suspense fallback={<p>Cargando...</p>}>
      <CheckoutForm />
    </Suspense>
  );
}