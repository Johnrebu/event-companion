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

export async function saveExpenseDraftToStorage(
  key: string,
  data: any,
  options: { isExplicitSave?: boolean } = {},
): Promise<void> {
  const cleanData = sanitizeForStorage(data);
  const hasContent = hasMeaningfulContent(cleanData);

  // Safety protection: Never allow background auto-save to overwrite an existing populated draft with empty data
  if (!hasContent && !options.isExplicitSave) {
    try {
      const db = await getDB();
      const existing = await new Promise<any>((resolve) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result ? req.result.data : null);
        req.onerror = () => resolve(null);
      });
      if (existing && hasMeaningfulContent(existing)) {
        console.warn(`[Storage Protection] Guarded populated draft for "${key}" against empty auto-save overwrite.`);
        return;
      }
    } catch {
      // Continue if safety check encounters error
    }
  }

  // 1. Always attempt to save to IndexedDB first (handles large base64 images without 5MB limit)
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const now = new Date().toISOString();
      const req = store.put({ key, data: cleanData, updatedAt: now });

      // If this draft has real items or bills, also save a permanent backup copy
      if (hasContent) {
        store.put({ key: "expense-report-backup-latest", data: cleanData, updatedAt: now });
        store.put({ key: `backup-${key}`, data: cleanData, updatedAt: now });
      }

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
    if (hasContent) {
      try {
        localStorage.setItem("expense-report-backup-latest", serialized);
      } catch {
        // Ignore backup quota error
      }
    }
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

  // 3. Fall back to legacy "expense-report" key if default entity has no data
  if (key === "expense-report-corona-creative") {
    try {
      const db = await getDB();
      const legacyResult = await new Promise<any>((resolve) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get("expense-report");
        req.onsuccess = () => resolve(req.result ? req.result.data : null);
        req.onerror = () => resolve(null);
      });
      if (legacyResult) return legacyResult;
    } catch {
      // Ignore
    }

    try {
      const legacySaved = localStorage.getItem("expense-report");
      if (legacySaved) {
        return JSON.parse(legacySaved);
      }
    } catch {
      // Ignore
    }
  }

  return null;
}

export interface AvailableDraftInfo {
  key: string;
  sourceLabel: string;
  companySlug?: string;
  itemCount: number;
  billCount: number;
  totalExpenses: number;
  eventName: string;
  updatedAt?: string;
  data: any;
}

const KNOWN_DRAFT_KEYS: { key: string; label: string; slug?: string }[] = [
  { key: "expense-report-corona-creative", label: "Corona Creative", slug: "corona-creative" },
  { key: "expense-report-aionion-capital", label: "Aionion Capital", slug: "aionion-capital" },
  { key: "expense-report-anshul-a-gupta-associates", label: "Anshul A Gupta & Associates", slug: "anshul-a-gupta-associates" },
  { key: "expense-report-quanticus", label: "Quanticus", slug: "quanticus" },
  { key: "expense-report", label: "Legacy Saved Session" },
  { key: "expense-report-backup-latest", label: "Auto-Backup Snapshot" },
];

export const hasMeaningfulContent = (data: any): boolean => {
  if (!data) return false;
  const hasEventName = Boolean(data.eventDetails?.eventName?.trim());
  const hasVenue = Boolean(data.eventDetails?.venue?.trim());
  const hasPhone = Boolean(data.eventDetails?.phone?.trim());
  const hasItems =
    Array.isArray(data.items) &&
    data.items.some(
      (item: any) =>
        Boolean(item?.particulars?.trim()) ||
        Boolean(Number(item?.income) > 0) ||
        Boolean(Number(item?.expenses) > 0) ||
        Boolean(item?.billFileName?.trim()) ||
        Boolean(item?.billUrl) ||
        (Array.isArray(item?.bills) && item.bills.length > 0),
    );
  return hasEventName || hasVenue || hasPhone || hasItems;
};

export async function findOtherSavedDrafts(currentKey: string): Promise<AvailableDraftInfo[]> {
  const draftsMap = new Map<string, AvailableDraftInfo>();

  // 1. Check IndexedDB
  try {
    const db = await getDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const records = req.result || [];
        for (const record of records) {
          if (!record || record.key === currentKey) continue;
          if (hasMeaningfulContent(record.data)) {
            const known = KNOWN_DRAFT_KEYS.find((k) => k.key === record.key);
            const items = record.data?.items || [];
            const meaningfulItems = items.filter(
              (i: any) =>
                Boolean(i?.particulars?.trim()) ||
                Boolean(Number(i?.income) > 0) ||
                Boolean(Number(i?.expenses) > 0) ||
                Boolean(i?.billFileName?.trim()) ||
                (Array.isArray(i?.bills) && i.bills.length > 0),
            );
            const billCount = items.reduce((acc: number, i: any) => {
              if (Array.isArray(i?.bills) && i.bills.length > 0) return acc + i.bills.length;
              if (i?.billFileName || i?.billUrl) return acc + 1;
              return acc;
            }, 0);
            const totalExpenses = items.reduce((acc: number, i: any) => acc + (Number(i?.expenses) || 0), 0);

            draftsMap.set(record.key, {
              key: record.key,
              sourceLabel: known ? known.label : record.key.replace("expense-report-", "").replace(/-/g, " "),
              companySlug: known?.slug,
              itemCount: meaningfulItems.length,
              billCount,
              totalExpenses,
              eventName: record.data?.eventDetails?.eventName || "Untitled Event",
              updatedAt: record.updatedAt,
              data: record.data,
            });
          }
        }
        resolve();
      };
      req.onerror = () => resolve();
    });
  } catch (err) {
    console.warn("Could not query IndexedDB for other drafts:", err);
  }

  // 2. Also check known localStorage keys
  for (const item of KNOWN_DRAFT_KEYS) {
    if (item.key === currentKey || draftsMap.has(item.key)) continue;
    try {
      const raw = localStorage.getItem(item.key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (hasMeaningfulContent(parsed)) {
          const items = parsed.items || [];
          const meaningfulItems = items.filter(
            (i: any) =>
              Boolean(i?.particulars?.trim()) ||
              Boolean(Number(i?.income) > 0) ||
              Boolean(Number(i?.expenses) > 0) ||
              Boolean(i?.billFileName?.trim()) ||
              (Array.isArray(i?.bills) && i.bills.length > 0),
          );
          const billCount = items.reduce((acc: number, i: any) => {
            if (Array.isArray(i?.bills) && i.bills.length > 0) return acc + i.bills.length;
            if (i?.billFileName || i?.billUrl) return acc + 1;
            return acc;
          }, 0);
          const totalExpenses = items.reduce((acc: number, i: any) => acc + (Number(i?.expenses) || 0), 0);

          draftsMap.set(item.key, {
            key: item.key,
            sourceLabel: item.label,
            companySlug: item.slug,
            itemCount: meaningfulItems.length,
            billCount,
            totalExpenses,
            eventName: parsed.eventDetails?.eventName || "Untitled Event",
            updatedAt: parsed.savedAt,
            data: parsed,
          });
        }
      }
    } catch {
      // Ignore parse error
    }
  }

  return Array.from(draftsMap.values());
}
