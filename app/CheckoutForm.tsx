"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

const CURRENCY = "COP";
const redirectUrl = `https://crispy-chikis-payment.vercel.app/resultado`;

function generateReference(username: string): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `${timestamp}-${username.replace(/\s+/g, "_")}`;
}

export default function Home() {
  const searchParams = useSearchParams();
  const amountInCents = searchParams.get("amount") || "0";
  const username = searchParams.get("username") || "usuario";

  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || "";
  const [signature, setSignature] = useState<string | null>(null);
  const [reference] = useState(() => generateReference(username));
  const [dots, setDots] = useState(".");
  const submitRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

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
      }
    }
    fetchSignature();
  }, []);

  useEffect(() => {
    if (signature && submitRef.current) {
      const timer = setTimeout(() => {
        submitRef.current?.click();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [signature]);

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
            <circle key={i} cx={30 + i * 60} cy={0} r={33} fill="#f38e35" />
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
            Redireccionando{dots}
          </p>
        </div>
      </div>

      <form
        action="https://checkout.wompi.co/p/"
        method="GET"
        className="hidden"
      >
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

        <button type="submit" ref={submitRef}></button>
      </form>
    </div>
  );
}