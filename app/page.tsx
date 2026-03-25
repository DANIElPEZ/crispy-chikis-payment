"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const CURRENCY = "COP";

function generateReference(username: string): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `${timestamp}-${username.replace(/\s+/g, "_")}`;
}

export default function Home() {
  const searchParams = useSearchParams();

  // Flutter pasa estos params en la URL
  const amountInCents = searchParams.get("amount") || "0";
  const username = searchParams.get("username") || "usuario";

  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || "";
  const [signature, setSignature] = useState<string | null>(null);
  const [reference] = useState(() => generateReference(username));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSignature() {
      try {
        const res = await fetch("/api/wompi-signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference,
            amountInCents,
            currency: CURRENCY,
          }),
        });
        const data = await res.json();
        setSignature(data.signature);
      } catch (err) {
        console.error("Error generando firma:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSignature();
  }, []);

  const redirectUrl = `https://crispychikis-payment.vercel.app/resultado`;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-100 text-center">
      <div className="mb-6">
        <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
          Total a pagar
        </p>
        <p className="text-3xl font-extrabold text-gray-900">
          ${(parseInt(amountInCents) / 100).toLocaleString("es-CO")}{" "}
          <span className="text-lg font-medium text-gray-500">COP</span>
        </p>
      </div>
      <form action="https://checkout.wompi.co/p/" method="GET">
        <input type="hidden" name="public-key" value={publicKey} />
        <input type="hidden" name="currency" value={CURRENCY} />
        <input type="hidden" name="amount-in-cents" value={amountInCents} />
        <input type="hidden" name="reference" value={reference} />
        <input
          type="hidden"
          name="signature:integrity"
          value={signature || ""}
        />
        <input type="hidden" name="redirect-url" value={redirectUrl} />

        <button
        type="submit"
        disabled={loading || !signature}
        className={`
          w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200
          ${loading || !signature 
            ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-indigo-200 active:scale-[0.98]'}
        `}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            {/* Spinner simple */}
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Cargando...
          </span>
        ) : (
          `Pagar ${(parseInt(amountInCents) / 100).toLocaleString('es-CO')} COP`
        )}
      </button>
      </form>
      <p className="mt-4 text-xs text-gray-400">
        Pago seguro procesado por <strong>Wompi</strong>
      </p>
    </div>
  );
}
