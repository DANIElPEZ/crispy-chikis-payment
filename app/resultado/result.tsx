'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from "next/image";

type TransactionStatus = 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | null;

export default function ResultTransaction() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('id');
  const [dots, setDots] = useState(".");

  useEffect(() => {
    if (!transactionId) return;

    async function verifyTransaction() {
      const res = await fetch(`/api/wompi-verify?id=${transactionId}`);
      const data = await res.json();
      const txStatus: TransactionStatus = data.status;

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

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center ">
            <svg
              viewBox="0 0 1200 60"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-13"
            >
              
              <rect className="w-full h-19" fill="#147c88" />
              {Array.from({ length: 20 }).map((_, i) => (
                <circle key={i} cx={30 + i * 60} cy={0} r={30} fill="#f38e35" />
              ))}
            </svg>
          <div
            className="w-full flex items-center justify-center bg-[#147c88] h-[29%]"
          />
          <div className="w-full flex-1 flex flex-col items-center justify-center gap-6 bg-[#f38e35]"></div>
    
          <div className="absolute z-10 flex flex-col items-center gap-6 top-20">
            <div className="rounded-2xl border-4 border-[#24151a]">
              <Image
                src="/logo.jpeg"
                alt="Crispy Chikis"
                width={250}
                height={200}
                className="rounded-xl"
              />
            </div>
            <div className="text-center">
              <p className="text-white font-extrabold text-xl tracking-wide font-serif ">
                Verificando pago{dots}
              </p>
            </div>
          </div>
  
        </div>
  );
}