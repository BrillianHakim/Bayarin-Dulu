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

export default function SesiSelesai() {
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

  // Generate teks WA
  const generateWAText = () => {
    let text = `💰 *Bayarin Dulu — ${namaSesi}*\n`;
    text += `Ditalangin: *${talangNama}*\n`;
    text += `Total: *Rp ${totalTagihan.toLocaleString("id-ID")}*\n\n`;
    text += `📋 *Tagihan per orang:*\n`;

    anggota
      .filter((a) => a.nama !== talangNama)
      .forEach((a) => {
        const total = hitungTotalPerOrang(a.id);
        text += `• ${a.nama}: Rp ${total.toLocaleString("id-ID")}\n`;

        items
          .filter((item) => item.anggota_ids.includes(a.id))
          .forEach((item) => {
            text += `  - ${item.nama}: Rp ${item.harga.toLocaleString("id-ID")}\n`;
          });
      });

    text += `\n_Kon Wes Mbayar A? 👆_`;
    return encodeURIComponent(text);
  };

  const shareToWA = () => {
    const text = generateWAText();
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-sm">

        {/* Header Selesai */}
        <div className="flex flex-col items-center justify-center bg-primary rounded-2xl py-8 mb-6 text-center">
          <span className="text-4xl mb-2">🎉</span>
          <h1 className="text-xl font-bold text-white">Sesi Selesai!</h1>
          <p className="text-sm text-primary-light mt-1">{namaSesi}</p>
          <p className="text-2xl font-bold text-white mt-3">
            Rp {totalTagihan.toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-primary-light mt-1">
            ditalangin {talangNama}
          </p>
        </div>

        {/* Summary tagihan */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
            Ringkasan transfer ke {talangNama}
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
                    → {talangNama}
                  </p>
                </div>
                <p className="text-sm font-semibold text-primary">
                  Rp {hitungTotalPerOrang(a.id).toLocaleString("id-ID")}
                </p>
              </div>
            ))}
        </div>

        {/* Tombol Share WA */}
        <button
          onClick={shareToWA}
          className="w-full bg-[#25D366] text-white font-semibold py-3 rounded-xl mb-3 hover:bg-[#1ebe5d] transition flex items-center justify-center gap-2"
        >
          <span className="text-lg">💬</span>
          Share ke WhatsApp
        </button>

        {/* Buat sesi baru */}
        <Link href="/buat">
          <button className="w-full bg-primary text-white font-semibold py-3 rounded-xl mb-3 hover:bg-primary-dark transition">
            + Buat Sesi Baru
          </button>
        </Link>

        <Link href="/">
          <button className="w-full border border-gray-200 text-gray-500 font-medium py-3 rounded-xl hover:bg-gray-100 transition">
            Kembali ke Home
          </button>
        </Link>

      </div>
    </div>
  );
}