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
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });

  return dbPromise;
};

// Strips non-serializable DOM File instances before storage so IndexedDB cloning never fails
const sanitizeForStorage = (data: any) => {
  if (!data || !Array.isArray(data.items)) return data;

  return {
    ...data,
    items: data.items.map((item: any) => ({
      ...item,
      billAttached: null,
      bills: (item.bills || []).map((b: any) => ({
        fileName: b.fileName,
        size: b.size,
        url: b.url, // Preserve genuine distinct URL for every single bill
      })),
    })),
  };
};

export async function saveExpenseDraftToStorage(key: string, data: any): Promise<void> {
  const cleanData = sanitizeForStorage(data);

  // 1. Always attempt to save to IndexedDB first (handles large base64 images without 5MB limit)
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({ key, data: cleanData, updatedAt: new Date().toISOString() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error || tx.error);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error("Transaction aborted"));
    });
  } catch (error) {
    console.warn("IndexedDB save failed, falling back to localStorage:", error);
  }

  // 2. Also save a lightweight version to localStorage as fallback
  try {
    const serialized = JSON.stringify(cleanData);
    localStorage.setItem(key, serialized);
  } catch {
    // If quota exceeded, strip heavy data URLs for localStorage fallback
    try {
      if (cleanData && Array.isArray(cleanData.items)) {
        const lightweight = {
          ...cleanData,
          items: cleanData.items.map((item: any) => ({
            ...item,
            billAttached: null,
            // CRITICAL: Clear item.billUrl so legacy field does NOT hold Bill #1's image while other bills are empty
            billUrl: undefined,
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
      req.onerror = () => reject(req.error || tx.error);
      tx.onerror = () => reject(tx.error);
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
