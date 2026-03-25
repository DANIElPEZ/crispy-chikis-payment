import { Suspense } from 'react';
import ResultTransaction from './result';

export default function Resultado() {
  return (
    <Suspense fallback={<p>Verificando pago...</p>}>
      <ResultTransaction />
    </Suspense>
  );
}