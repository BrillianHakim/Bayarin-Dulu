"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Anggota {
  id: string;
  nama: string;
  sudah_bayar: boolean;
}

interface ItemDenganPembayar {
  id: string;
  nama: string;
  harga: number;
  anggota_ids: string[];
}

export default function SesiAktif() {
  const params = useParams();
  
  const sesiId = params.id as string;

  const [namaSesi, setNamaSesi] = useState("");
  const [talangNama, setTalangNama] = useState("");
  const [anggota, setAnggota] = useState<Anggota[]>([]);
  const [items, setItems] = useState<ItemDenganPembayar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sesiId) fetchData();
  }, [sesiId]);

  const fetchData = async () => {
    setLoading(true);

    // Ambil data sesi
    const { data: sesiData } = await supabase
      .from("sesi")
      .select("*")
      .eq("id", sesiId)
      .single();

    if (sesiData) {
      setNamaSesi(sesiData.nama_sesi);
      setTalangNama(sesiData.talang_nama);
    }

    // Ambil semua anggota di sesi ini
    const { data: anggotaData } = await supabase
      .from("anggota")
      .select("*")
      .eq("sesi_id", sesiId);

    if (anggotaData) setAnggota(anggotaData);

    // Ambil semua item + siapa aja yang pesan (join manual)
    const { data: itemData } = await supabase
      .from("item")
      .select("*")
      .eq("sesi_id", sesiId);

    if (itemData) {
      const itemsWithPembayar: ItemDenganPembayar[] = [];
      for (const item of itemData) {
        const { data: relasiData } = await supabase
          .from("item_anggota")
          .select("anggota_id")
          .eq("item_id", item.id);

        itemsWithPembayar.push({
          id: item.id,
          nama: item.nama,
          harga: item.harga,
          anggota_ids: relasiData?.map((r) => r.anggota_id) || [],
        });
      }
      setItems(itemsWithPembayar);
    }

    setLoading(false);
  };

  const hitungTotalPerOrang = (anggotaId: string) => {
    return items.reduce((sum, item) => {
      if (item.anggota_ids.includes(anggotaId)) {
        return sum + item.harga;
      }
      return sum;
    }, 0);
  };

  const totalTagihan = items.reduce(
    (sum, item) => sum + item.harga * item.anggota_ids.length,
    0
  );

  const totalSudahBayar = anggota
  .filter((a) => a.sudah_bayar && a.nama !== talangNama)
  .reduce((sum, a) => sum + hitungTotalPerOrang(a.id), 0);

  const toggleBayar = async (anggotaId: string, currentStatus: boolean) => {
    await supabase
      .from("anggota")
      .update({ sudah_bayar: !currentStatus })
      .eq("id", anggotaId);

    setAnggota((prev) =>
      prev.map((a) =>
        a.id === anggotaId ? { ...a, sudah_bayar: !currentStatus } : a
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Memuat sesi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Link href="/">
            <button className="text-gray-500 text-xl">←</button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-800 flex-1">
            Sesi Aktif
          </h1>
          <span className="text-xs px-2 py-1 bg-primary-light text-primary-dark rounded-full font-medium">
            ● Live
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          {namaSesi} · {anggota.length} orang · ditalangin {talangNama}
        </p>

        {/* Stats */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Total Tagihan</p>
            <p className="text-base font-semibold text-primary mt-1">
              Rp {totalTagihan.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="flex-1 bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Sudah Bayar</p>
            <p className="text-base font-semibold text-primary mt-1">
              Rp {totalSudahBayar.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Status per orang */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
            Status per orang
          </p>
          {anggota.map((a) => {
  const isPenalang = a.nama === talangNama;
  return (
    <div
      key={a.id}
      className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-none"
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${isPenalang ? "bg-accent text-white" : "bg-primary-light text-primary-dark"}`}>
        {a.nama.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <span className="text-sm text-gray-700">{a.nama}</span>
        {isPenalang && (
          <span className="ml-2 text-xs bg-accent-light text-accent-dark px-2 py-0.5 rounded-full font-medium">
            Penalang 👑
          </span>
        )}
      </div>
      <span className="text-xs text-gray-400">
        Rp {hitungTotalPerOrang(a.id).toLocaleString("id-ID")}
      </span>
      {isPenalang ? (
        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-accent-light text-accent-dark">
          Lunas ✓
        </span>
      ) : (
        <button
          onClick={() => toggleBayar(a.id, a.sudah_bayar)}
          className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
            a.sudah_bayar
              ? "bg-primary-light text-primary-dark"
              : "bg-red-50 text-red-500"
          }`}
        >
          {a.sudah_bayar ? "Lunas ✓" : "Belum"}
        </button>
      )}
    </div>
  );
})}
        </div>

        {/* CTA */}
        <Link href={`/ringkasan/${sesiId}`}>
          <button className="w-full bg-primary text-white font-semibold py-3 rounded-xl text-sm hover:bg-primary-dark transition">
            Selesaikan Sesi
          </button>
        </Link>

      </div>
    </div>
  );
}