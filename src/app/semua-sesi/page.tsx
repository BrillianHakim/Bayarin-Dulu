"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getSesiIds, hapusSesiId } from "@/lib/localSesi";

interface Sesi {
  id: string;
  nama_sesi: string;
  talang_nama: string;
  status: string;
  created_at: string;
}

type Filter = "semua" | "aktif" | "selesai";

export default function SemuaSesi() {
  const [sesiList, setSesiList] = useState<Sesi[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("semua");
  const [hapusId, setHapusId] = useState<string | null>(null);
  const [hapusLoading, setHapusLoading] = useState(false);

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
    .in("id", ids)
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
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const konfirmasiHapus = (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // biar link card gak ikut ke-klik
    e.stopPropagation();
    setHapusId(id);
  };

  const batalHapus = () => setHapusId(null);

  const hapusSesi = async () => {
  if (!hapusId) return;
  setHapusLoading(true);

  const { error } = await supabase
    .from("sesi")
    .delete()
    .eq("id", hapusId);

  if (error) {
    alert("Gagal hapus sesi, coba lagi.");
  } else {
    hapusSesiId(hapusId); // hapus dari localStorage juga
    setSesiList((prev) => prev.filter((s) => s.id !== hapusId));
  }

  setHapusId(null);
  setHapusLoading(false);
};

  const filtered = sesiList.filter((s) => {
    if (filter === "aktif") return s.status === "aktif";
    if (filter === "selesai") return s.status === "selesai";
    return true;
  });

  const namaSesiHapus = sesiList.find((s) => s.id === hapusId)?.nama_sesi;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Link href="/">
            <button className="text-gray-500 text-xl">←</button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-800 flex-1">
            Semua Sesi
          </h1>
          <span className="text-xs text-gray-400">
            {filtered.length} sesi
          </span>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {(["semua", "aktif", "selesai"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                filter === f
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-primary hover:text-primary"
              }`}
            >
              {f === "semua" ? "Semua" : f === "aktif" ? "Aktif" : "Selesai"}
            </button>
          ))}
        </div>

        {/* List sesi */}
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
            <p className="text-sm text-gray-400">Memuat sesi...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
            <span className="text-3xl">🗒️</span>
            <p className="text-sm text-gray-400 mt-2">
              {filter === "aktif"
                ? "Tidak ada sesi aktif"
                : filter === "selesai"
                ? "Belum ada sesi selesai"
                : "Belum ada sesi sama sekali"}
            </p>
          </div>
        ) : (
          filtered.map((sesi) => (
            <Link
              key={sesi.id}
              href={
                sesi.status === "selesai"
                  ? `/selesai/${sesi.id}`
                  : `/sesi/${sesi.id}`
              }
            >
              <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm hover:border-primary transition cursor-pointer">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">
                      {sesi.nama_sesi}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Ditalangin {sesi.talang_nama} ·{" "}
                      {formatTanggal(sesi.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        sesi.status === "selesai"
                          ? "bg-primary-light text-primary-dark"
                          : "bg-accent-light text-accent-dark"
                      }`}
                    >
                      {sesi.status === "selesai" ? "Selesai ✓" : "Aktif"}
                    </span>
                    <button
                      onClick={(e) => konfirmasiHapus(sesi.id, e)}
                      className="text-gray-300 hover:text-red-400 transition p-1 rounded-lg hover:bg-red-50"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}

        {filtered.length > 0 && (
          <Link href="/buat">
            <button className="w-full bg-primary text-white font-semibold py-3 rounded-xl mt-2 hover:bg-primary-dark transition">
              + Buat Sesi Baru
            </button>
          </Link>
        )}

      </div>

      {/* Modal Konfirmasi Hapus */}
      {hapusId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="text-center mb-4">
              <span className="text-4xl">🗑️</span>
              <h2 className="text-base font-semibold text-gray-800 mt-2">
                Hapus Sesi?
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Sesi{" "}
                <span className="font-medium text-gray-700">
                  "{namaSesiHapus}"
                </span>{" "}
                akan dihapus permanen beserta semua data anggota dan itemnya.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={batalHapus}
                className="flex-1 border border-gray-200 text-gray-500 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={hapusSesi}
                disabled={hapusLoading}
                className="flex-1 bg-red-500 text-white font-semibold py-2.5 rounded-xl hover:bg-red-600 transition disabled:opacity-50"
              >
                {hapusLoading ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}