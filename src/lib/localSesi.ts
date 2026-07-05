const KEY = "bayarin_dulu_sesi_ids";

export const simpanSesiId = (id: string) => {
  const existing = getSesiIds();
  if (!existing.includes(id)) {
    localStorage.setItem(KEY, JSON.stringify([id, ...existing]));
  }
};

export const getSesiIds = (): string[] => {
  try {
    const data = localStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const hapusSesiId = (id: string) => {
  const existing = getSesiIds();
  localStorage.setItem(KEY, JSON.stringify(existing.filter((s) => s !== id)));
};