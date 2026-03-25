'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type TransactionStatus = 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | null;

export default function Resultado() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('id');
  const [status, setStatus] = useState<TransactionStatus>(null);

  useEffect(() => {
    if (!transactionId) return;

    async function verifyTransaction() {
      const res = await fetch(`/api/wompi-verify?id=${transactionId}`);
      const data = await res.json();
      const txStatus: TransactionStatus = data.status;
      setStatus(txStatus);

      if (typeof window !== 'undefined' && (window as any).FlutterChannel) {
        (window as any).FlutterChannel.postMessage(
          JSON.stringify({
            paymentSuccess: txStatus === 'APPROVED',
            transactionId,
            status: txStatus,
          })
        );
      }
    }

    verifyTransaction();
  }, [transactionId]);

  return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      {!status && <p>Verificando pago...</p>}
      {status === 'APPROVED' && <p>✅ ¡Pago exitoso! Puedes continuar con tu pedido.</p>}
      {status === 'DECLINED' && <p>❌ Pago rechazado. Intenta de nuevo.</p>}
      {status && status !== 'APPROVED' && status !== 'DECLINED' && (
        <p>⚠️ Estado del pago: {status}</p>
      )}
    </div>
  );
}