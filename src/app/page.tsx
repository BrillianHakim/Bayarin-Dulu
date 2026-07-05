"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getSesiIds } from "@/lib/localSesi";

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
    const ids = getSesiIds();

    if (ids.length === 0) {
      setSesiList([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("sesi")
      .select("*")
      .in("id", ids.slice(0, 3))
      .order("created_at", { ascending: false });

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
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-sm">

        {/* Hero */}
        <div className="bg-white px-5 pt-8 pb-6 border-b border-gray-100">
          <div className="flex flex-col items-center">
            <img
              src="/BayarinDulu.png"
              alt="Bayarin Dulu"
              className="h-20 w-auto object-contain mb-1"
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-5">

          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Sesi terbaru
            </p>
            <Link href="/semua-sesi">
              <span className="text-xs text-primary font-medium">
                Lihat semua →
              </span>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2 mb-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                    <div className="flex-1">
                      <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                      <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : sesiList.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🧾</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Belum ada sesi</p>
              <p className="text-xs text-gray-400 mt-1">
                Buat sesi pertamamu sekarang!
              </p>
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              {sesiList.map((sesi) => (
                <Link
                  key={sesi.id}
                  href={sesi.status === "selesai" ? `/selesai/${sesi.id}` : `/sesi/${sesi.id}`}
                >
                  <div className="bg-white rounded-2xl p-4 flex items-center gap-3 hover:shadow-sm transition-shadow cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary-dark">
                        {sesi.nama_sesi.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {sesi.nama_sesi}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Ditalangin {sesi.talang_nama} · {formatTanggal(sesi.created_at)}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${
                      sesi.status === "selesai"
                        ? "bg-primary-light text-primary-dark"
                        : "bg-accent-light text-accent-dark"
                    }`}>
                      {sesi.status === "selesai" ? "Selesai" : "Aktif"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <Link href="/buat">
            <button className="w-full bg-primary text-white font-semibold py-3.5 rounded-2xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 mb-3">
              <span className="text-lg">+</span>
              Buat Sesi Baru
            </button>
          </Link>

          <Link href="/semua-sesi">
            <button className="w-full border border-gray-200 text-gray-500 font-medium py-3 rounded-2xl hover:bg-gray-100 transition-colors text-sm">
              Lihat Semua Sesi
            </button>
          </Link>

        </div>
      </div>
    </div>
  );
}