type Draft = {
  image: string;
  occasion: string;
  budget: string;
  notes: string;
  savedAt: number;
};
function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("glammetrics-draft", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("draft");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
export async function writeDraft(value: Draft | null) {
  const db = await open();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("draft", "readwrite");
      const store = tx.objectStore("draft");
      if (value) store.put(value, "current");
      else store.delete("current");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
export async function readDraft(): Promise<Draft | null> {
  const db = await open();
  let value: Draft | undefined;
  try {
    value = await new Promise((resolve, reject) => {
      const req = db.transaction("draft").objectStore("draft").get("current");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
  if (value && Date.now() - value.savedAt < 2 * 60 * 60 * 1000) {
    await writeDraft(null);
    return value;
  }
  await writeDraft(null);
  return null;
}
