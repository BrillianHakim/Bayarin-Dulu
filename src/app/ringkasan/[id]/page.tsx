"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function Ringkasan() {
  const params = useParams();
  const router = useRouter();
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

    const { data: sesiData } = await supabase
      .from("sesi")
      .select("*")
      .eq("id", sesiId)
      .single();

    if (sesiData) {
      setNamaSesi(sesiData.nama_sesi);
      setTalangNama(sesiData.talang_nama);
    }

    const { data: anggotaData } = await supabase
      .from("anggota")
      .select("*")
      .eq("sesi_id", sesiId);

    if (anggotaData) setAnggota(anggotaData);

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

  const selesaikanSesi = async () => {
  await supabase
    .from("sesi")
    .update({ status: "selesai" })
    .eq("id", sesiId);
  router.push(`/selesai/${sesiId}`);
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Memuat ringkasan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Link href={`/sesi/${sesiId}`}>
            <button className="text-gray-500 text-xl">←</button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-800">Ringkasan</h1>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          {namaSesi} · ditalangin {talangNama}
        </p>

        {/* Total */}
        <div className="bg-primary rounded-xl p-4 mb-4 text-center">
          <p className="text-xs text-primary-light uppercase tracking-wide">
            Total Tagihan
          </p>
          <p className="text-2xl font-bold text-white mt-1">
            Rp {totalTagihan.toLocaleString("id-ID")}
          </p>
        </div>

        {/* Siapa bayar ke siapa */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
            Siapa transfer ke {talangNama}
          </p>
          {anggota
            .filter((a) => a.nama !== talangNama)
            .map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-none"
              >
                <div className="w-8 h-8 rounded-full bg-primary-light text-primary-dark flex items-center justify-center text-xs font-semibold">
                  {a.nama.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{a.nama}</p>
                  <p className="text-xs text-gray-400">
                    Transfer / QRIS ke {talangNama}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">
                    Rp {hitungTotalPerOrang(a.id).toLocaleString("id-ID")}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      a.sudah_bayar
                        ? "bg-primary-light text-primary-dark"
                        : "bg-red-50 text-red-500"
                    }`}
                  >
                    {a.sudah_bayar ? "Lunas ✓" : "Belum bayar"}
                  </span>
                </div>
              </div>
            ))}
        </div>

        {/* Detail pesanan per orang */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
            Detail pesanan
          </p>
          {anggota.map((a) => (
            <div key={a.id} className="mb-3 last:mb-0">
              <p className="text-sm font-medium text-gray-700 mb-1">
                {a.nama}
                {a.nama === talangNama && (
                  <span className="ml-1 text-xs text-accent-dark">👑</span>
                )}
              </p>
              {items
                .filter((item) => item.anggota_ids.includes(a.id))
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-xs text-gray-500 py-0.5"
                  >
                    <span>{item.nama}</span>
                    <span>Rp {item.harga.toLocaleString("id-ID")}</span>
                  </div>
                ))}
              <div className="flex justify-between text-xs font-medium text-gray-700 pt-1 border-t border-gray-100 mt-1">
                <span>Total</span>
                <span>Rp {hitungTotalPerOrang(a.id).toLocaleString("id-ID")}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={selesaikanSesi}
          className="w-full bg-accent text-white font-semibold py-3 rounded-xl mb-3 hover:bg-accent-dark transition"
        >
          Tandai Sesi Selesai ✓
        </button>

        <Link href="/">
          <button className="w-full border border-primary text-primary font-medium py-3 rounded-xl hover:bg-primary-light transition">
            Buat Sesi Baru
          </button>
        </Link>

      </div>
    </div>
  );
}