"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Member {
  id: string;
  name: string;
}

interface Item {
  id: string;
  name: string;
  price: number;
  sharedBy: string[]; // array of member id — kalau lebih dari 1, harga dibagi rata
}

export default function BuatSesi() {
  const [namaSesi, setNamaSesi] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [items, setItems] = useState<Item[]>([]);

  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const [talangId, setTalangId] = useState("");

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const tambahMember = () => {
    if (newMemberName.trim() === "") return;
    setMembers([...members, { id: Date.now().toString(), name: newMemberName }]);
    setNewMemberName("");
  };

  const hapusMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
    if (talangId === id) setTalangId("");
  };

  const toggleSelectedMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const tambahItem = () => {
    if (itemName.trim() === "" || itemPrice.trim() === "" || selectedMembers.length === 0) return;
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        name: itemName,
        price: parseInt(itemPrice),
        sharedBy: selectedMembers,
      },
    ]);
    setItemName("");
    setItemPrice("");
    setSelectedMembers([]);
  };

  const hapusItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  // Hitung total yang harus dibayar tiap anggota
const hitungTotalPerOrang = (memberId: string) => {
  return items.reduce((sum, item) => {
    if (item.sharedBy.includes(memberId)) {
      return sum + item.price; // harga penuh, gak dibagi lagi
    }
    return sum;
  }, 0);
};

const mulaiSesi = async () => {
  if (!bisaLanjut) return;
  setLoading(true);

  try {
    const talangNama = namaMember(talangId);

    // 1. Insert sesi
    const { data: sesiData, error: sesiError } = await supabase
      .from("sesi")
      .insert({ nama_sesi: namaSesi, talang_nama: talangNama })
      .select()
      .single();

    if (sesiError) throw sesiError;
    const sesiId = sesiData.id;

    // 2. Insert semua anggota, simpan mapping id lokal -> id supabase
    const anggotaMap: Record<string, string> = {};
    for (const m of members) {
      const { data: anggotaData, error: anggotaError } = await supabase
        .from("anggota")
        .insert({ sesi_id: sesiId, nama: m.name })
        .select()
        .single();

      if (anggotaError) throw anggotaError;
      anggotaMap[m.id] = anggotaData.id;
    }

    // 3. Insert semua item, lalu insert relasi item_anggota
    for (const item of items) {
      const { data: itemData, error: itemError } = await supabase
        .from("item")
        .insert({ sesi_id: sesiId, nama: item.name, harga: item.price })
        .select()
        .single();

      if (itemError) throw itemError;

      const relasiPembayar = item.sharedBy.map((localId) => ({
        item_id: itemData.id,
        anggota_id: anggotaMap[localId],
      }));

      const { error: relasiError } = await supabase
        .from("item_anggota")
        .insert(relasiPembayar);

      if (relasiError) throw relasiError;
    }

    // 4. Redirect ke halaman sesi aktif
    router.push(`/sesi/${sesiId}`);
  } catch (err) {
    console.error(err);
    alert("Ada error pas menyimpan sesi. Coba cek console.");
    setLoading(false);
  }
};

  const totalSemua = items.reduce((sum, item) => sum + item.price * item.sharedBy.length, 0);

  const namaMember = (id: string) => members.find((m) => m.id === id)?.name || "";

  const bisaLanjut =
    namaSesi.trim() !== "" && members.length >= 1 && items.length > 0 && talangId !== "";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/">
            <button className="text-gray-500 text-xl">←</button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-800">Buat Sesi Baru</h1>
        </div>

        {/* Nama Sesi */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
          <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">
            Nama Sesi
          </label>
          <input
            type="text"
            value={namaSesi}
            onChange={(e) => setNamaSesi(e.target.value)}
            placeholder="cth. Warmindo bareng geng..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
        </div>

        {/* Anggota */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
          <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">
            Anggota
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {members.map((m) => (
              <span
                key={m.id}
                className="bg-primary text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1"
              >
                {m.name}
                <button onClick={() => hapusMember(m.id)} className="ml-1 hover:text-red-200">
                  ×
                </button>
              </span>
            ))}
            {members.length === 0 && (
              <p className="text-xs text-gray-400 italic">Belum ada anggota, tambahkan dulu</p>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && tambahMember()}
              placeholder="Nama teman..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
            <button
              onClick={tambahMember}
              className="bg-primary-light text-primary-dark px-3 rounded-lg text-sm font-medium"
            >
              + Tambah
            </button>
          </div>
        </div>

        {/* Item / Pesanan */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
          <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">
            Item / Pesanan
          </label>

          {items.map((item) => (
            <div key={item.id} className="py-2 border-b border-gray-100 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">
  Rp {(item.price * item.sharedBy.length).toLocaleString("id-ID")}
</span>
                  <button onClick={() => hapusItem(item.id)} className="text-red-400 hover:text-red-600">
                    ×
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
  {item.sharedBy.length > 1 ? "Masing-masing pesan: " : "Dipesan: "}
  {item.sharedBy.map((id) => namaMember(id)).join(", ")}
  {item.sharedBy.length > 1 &&
    ` (@Rp ${item.price.toLocaleString("id-ID")} /orang)`}
</p>
            </div>
          ))}

          {/* Form tambah item */}
          {members.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Nama item..."
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
                <input
                  type="number"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  placeholder="Harga"
                  className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <p className="text-xs text-gray-400 mb-1.5">Untuk siapa? (bisa pilih lebih dari 1)</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {members.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => toggleSelectedMember(m.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition ${
                      selectedMembers.includes(m.id)
                        ? "bg-accent text-accent-dark border-accent font-medium"
                        : "bg-white text-gray-500 border-gray-200"
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>

              <button
                onClick={tambahItem}
                disabled={itemName.trim() === "" || itemPrice.trim() === "" || selectedMembers.length === 0}
                className="w-full bg-primary-light text-primary-dark py-2 rounded-lg text-sm font-medium disabled:opacity-40"
              >
                + Tambah Item
              </button>
            </div>
          )}

          {items.length > 0 && (
            <div className="flex justify-between mt-3 pt-3 border-t border-gray-200 font-semibold text-gray-800">
              <span>Total</span>
              <span>Rp {totalSemua.toLocaleString("id-ID")}</span>
            </div>
          )}
        </div>

        {/* Siapa yang nalangin */}
        {members.length > 0 && items.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
            <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">
              Siapa yang bayar duluan?
            </label>
            <select
              value={talangId}
              onChange={(e) => setTalangId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
            >
              <option value="">Pilih anggota...</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Preview hitungan */}
        {items.length > 0 && members.length > 0 && (
          <div className="bg-primary-light rounded-xl p-4 mb-4">
            <p className="text-xs text-primary-dark uppercase tracking-wide font-medium mb-2">
              Preview tagihan per orang
            </p>
            {members.map((m) => (
              <div key={m.id} className="flex justify-between text-sm py-1">
                <span className="text-gray-700">{m.name}</span>
                <span className="font-medium text-gray-800">
                  Rp {hitungTotalPerOrang(m.id).toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <button
  onClick={mulaiSesi}
  disabled={!bisaLanjut || loading}
  className="w-full bg-primary text-white font-semibold py-3 rounded-xl mb-3 hover:bg-primary-dark transition disabled:bg-gray-300 disabled:cursor-not-allowed"
>
  {loading ? "Menyimpan..." : "Mulai Sesi →"}
</button>

      </div>
    </div>
  );
}