"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Sesi {
  id: string;
  nama_sesi: string;
  talang_nama: string;
  status: string;
  created_at: string;
}

export default function Home() {
  const [sesiList, setSesiList] = useState<Sesi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSesi();
  }, []);

  const fetchSesi = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("sesi")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3);

    if (data) setSesiList(data);
    setLoading(false);
  };

  const formatTanggal = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hari ini";
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-sm">

        {/* Logo & Tagline */}
        <div className="flex flex-col items-center justify-center bg-white rounded-2xl py-6 mb-6 border border-gray-100 shadow-sm">
          <img
            src="/BayarinDulu.png"
            alt="Bayarin Dulu"
            className="h-24 w-auto object-contain"
          />
          <p className="text-sm text-gray-500 mt-2">
            Patungan jadi gampang, nggak usah ribet!
          </p>
        </div>

        {/* Riwayat Sesi */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
            Riwayat Sesi
          </p>

          {loading ? (
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
              <p className="text-sm text-gray-400">Memuat riwayat...</p>
            </div>
          ) : sesiList.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
              <p className="text-sm text-gray-400">Belum ada sesi.</p>
              <p className="text-xs text-gray-300 mt-1">
                Buat sesi pertamamu sekarang!
              </p>
            </div>
          ) : (
            sesiList.map((sesi) => (
              <Link
                key={sesi.id}
                href={
                  sesi.status === "selesai"
                    ? `/selesai/${sesi.id}`
                    : `/sesi/${sesi.id}`
                }
              >
                <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm hover:border-primary transition cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">
                        {sesi.nama_sesi}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Ditalangin {sesi.talang_nama} ·{" "}
                        {formatTanggal(sesi.created_at)}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ml-2 ${
                        sesi.status === "selesai"
                          ? "bg-primary-light text-primary-dark"
                          : "bg-accent-light text-accent-dark"
                      }`}
                    >
                      {sesi.status === "selesai" ? "Selesai ✓" : "Aktif"}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* CTA */}
        <Link href="/buat">
          <button className="w-full bg-primary text-white font-semibold py-3 rounded-xl mb-3 hover:bg-primary-dark transition">
            + Buat Sesi Baru
          </button>
        </Link>
        <Link href="/semua-sesi">
  <button className="w-full border border-primary text-primary font-medium py-3 rounded-xl hover:bg-primary-light transition">
    Lihat Semua Sesi
  </button>
</Link>

      </div>
    </div>
  );
}