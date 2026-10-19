const DB_NAME = "expense_command_center_db";
const STORE_NAME = "drafts";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

const getDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not supported"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
};

export async function saveExpenseDraftToStorage(key: string, data: any): Promise<void> {
  // Always attempt to save to IndexedDB first (handles large base64 images without 5MB limit)
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({ key, data, updatedAt: new Date().toISOString() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.warn("IndexedDB save failed, falling back to localStorage:", error);
  }

  // Also save a lightweight version to localStorage as fallback
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
  } catch (error) {
    // If quota exceeded, strip heavy data URLs for localStorage fallback
    try {
      if (data && Array.isArray(data.items)) {
        const lightweight = {
          ...data,
          items: data.items.map((item: any) => ({
            ...item,
            billAttached: null,
            bills: (item.bills || []).map((b: any) => ({
              fileName: b.fileName,
              size: b.size,
              // omit large url in localStorage fallback
            })),
          })),
        };
        localStorage.setItem(key, JSON.stringify(lightweight));
      }
    } catch {
      // Ignore fallback quota error
    }
  }
}

export async function loadExpenseDraftFromStorage(key: string): Promise<any | null> {
  // 1. Try loading from IndexedDB first (most complete with full images)
  try {
    const db = await getDB();
    const result = await new Promise<any>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.data : null);
      req.onerror = () => reject(req.error);
    });

    if (result) return result;
  } catch (error) {
    console.warn("IndexedDB load failed, trying localStorage:", error);
  }

  // 2. Fall back to localStorage
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("localStorage load failed:", error);
  }

  return null;
}
