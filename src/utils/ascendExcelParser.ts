import * as XLSX from 'xlsx';
import { AscendAttendee, AscendSession, CheckInStatus } from '@/types/ascend';

/**
 * Normalizes a header or key name for fuzzy, case-insensitive comparison.
 * Strips all whitespace, punctuation, dashes, underscores, and brackets.
 */
export function normalizeKey(str: string): string {
    if (!str) return '';
    return String(str)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
}

/**
 * Searches a row object for values matching a list of candidate keys/patterns.
 */
export function findRowValue(row: Record<string, any>, candidateKeys: string[]): string {
    if (!row || typeof row !== 'object') return '';
    const rowKeys = Object.keys(row);

    // 1. Direct exact normalized match
    for (const cand of candidateKeys) {
        const normCand = normalizeKey(cand);
        for (const rk of rowKeys) {
            const normRk = normalizeKey(rk);
            if (normRk === normCand) {
                const val = row[rk];
                if (val !== undefined && val !== null && String(val).trim() !== '') {
                    return String(val).trim();
                }
            }
        }
    }

    // 2. Substring normalized match (e.g. "whichsessionwouldyouprefertoattend" contains "whichsession")
    for (const cand of candidateKeys) {
        const normCand = normalizeKey(cand);
        if (normCand.length < 3) continue; // avoid tiny generic substrings
        for (const rk of rowKeys) {
            const normRk = normalizeKey(rk);
            if (normRk.includes(normCand) || normCand.includes(normRk)) {
                const val = row[rk];
                if (val !== undefined && val !== null && String(val).trim() !== '') {
                    return String(val).trim();
                }
            }
        }
    }

    return '';
}

/**
 * Clean and parse contact numbers from single or multiple numbers (e.g. "8681954435/9940050467", "+91 9962542048").
 */
export function parseContactNumbers(rawPhone: string | number | undefined | null): {
    primary: string;
    secondary?: string;
} {
    if (rawPhone === undefined || rawPhone === null) {
        return { primary: '9840000000' };
    }

    const strVal = String(rawPhone).trim();
    if (!strVal) return { primary: '9840000000' };

    // Check if multiple phone numbers separated by delimiter (/ , ; & | or space)
    const parts = strVal.split(/[/,;&|\s]+/).map(p => p.trim()).filter(Boolean);

    const cleanNumber = (numStr: string): string => {
        // Extract digits only
        let digits = numStr.replace(/\D/g, '');
        // If has 91 country code prefix (e.g., 919962542048) -> strip 91
        if (digits.length === 12 && digits.startsWith('91')) {
            digits = digits.slice(2);
        }
        // If has leading 0 (e.g., 09962542048) -> strip 0
        if (digits.length === 11 && digits.startsWith('0')) {
            digits = digits.slice(1);
        }
        // If longer than 10 digits, take the last 10 digits
        if (digits.length > 10) {
            digits = digits.slice(-10);
        }
        return digits;
    };

    const primaryDigits = cleanNumber(parts[0] || strVal);
    const primary = primaryDigits.length >= 7 ? primaryDigits : (primaryDigits || '9840000000');

    let secondary: string | undefined = undefined;
    if (parts.length > 1) {
        const secondaryDigits = cleanNumber(parts[1]);
        if (secondaryDigits && secondaryDigits.length >= 7) {
            secondary = secondaryDigits;
        }
    }

    return { primary, secondary };
}

/**
 * Parse session text into AscendSession type accurately.
 * Handles formats like:
 * - "Evening Session - Timing: 6:00 PM - 9:00 PM"
 * - "Morning Session - Timing: 10:00 AM - 1:00 PM"
 * - "Evening Gathering" / "Morning Gathering"
 * - "Evening", "Morning", "6:00 PM", "10:00 AM"
 */
export function parseSession(rawSession: string | undefined | null): AscendSession {
    if (!rawSession) return 'Morning Gathering';
    const s = String(rawSession).trim().toLowerCase();

    // Check for evening cues
    if (
        s.includes('evening') ||
        s.includes('6:00') ||
        s.includes('6.00') ||
        s.includes('6 pm') ||
        s.includes('6pm') ||
        s.includes('18:00') ||
        s.includes('dinner') ||
        s.includes('night') ||
        s.includes('gala') ||
        (s.includes('pm') && !s.includes('10:00') && !s.includes('10 am') && !s.includes('morning'))
    ) {
        return 'Evening Gathering';
    }

    // Check for morning cues
    if (
        s.includes('morning') ||
        s.includes('10:00') ||
        s.includes('10.00') ||
        s.includes('10 am') ||
        s.includes('10am') ||
        s.includes('breakfast') ||
        s.includes('lunch') ||
        s.includes('keynote') ||
        (s.includes('am') && !s.includes('evening'))
    ) {
        return 'Morning Gathering';
    }

    if (s.includes('general') || s.includes('all')) {
        return 'General';
    }

    return 'Morning Gathering';
}

/**
 * Parsed row extraction specifically calibrated for all Aionion Ascend spreadsheets
 * (Google Forms responses, LibreOffice / Excel dumps, custom CRM exports).
 */
export function parseAscendRow(
    row: Record<string, any>,
    index: number
): { attendee: AscendAttendee | null; error?: string } {
    if (!row || typeof row !== 'object') {
        return { attendee: null, error: `Row ${index + 2}: Empty or invalid record` };
    }

    // 1. Client Name
    let rawName = findRowValue(row, [
        'Client Name',
        'ClientName',
        'Name',
        'Guest Name',
        'Customer Name',
        'Full Name',
        'Attendee Name',
        'Client',
    ]);

    // 2. Client Code
    const rawCode = findRowValue(row, [
        'ClientCode',
        'Client Code',
        'Client ID',
        'ClientID',
        'Code',
        'Account Code',
        'Customer Code',
        'UCC',
        'ID',
    ]);

    // If both name and code are missing, this is an empty blank row
    if (!rawName && !rawCode) {
        return { attendee: null };
    }

    // If name is empty but code is present (e.g. row 5 in some sheets)
    if (!rawName && rawCode) {
        rawName = `Client ${rawCode}`;
    }

    // 3. Contact Number
    const rawPhone = findRowValue(row, [
        'ClientPhoneNumer', // typo handling from Google Form / sheet
        'ClientPhoneNumber',
        'Client Phone Number',
        'Client Phone Number / Mobile',
        'Client Phone',
        'Contact Number',
        'Contact No',
        'Mobile Number',
        'Mobile No',
        'Phone Number',
        'Phone',
        'Mobile',
        'Cell',
        'Contact',
    ]);
    const { primary: contactNumber, secondary: secondaryContact } = parseContactNumbers(rawPhone);

    // 4. Email
    const rawEmail = findRowValue(row, [
        'ClientEmailId',
        'Client Email Id',
        'Client Email ID',
        'ClientEmail',
        'Client Email',
        'EmailId',
        'Email ID',
        'Email Address',
        'Email',
        'Mail',
    ]);

    // 5. Session
    const rawSession = findRowValue(row, [
        'Which session would you prefer to attend?',
        'Which session would you prefer to attend',
        'Which session',
        'Session Preference',
        'Preferred Session',
        'Session Type',
        'Session Timing',
        'Session',
        'Gathering',
        'Timing',
        'Slot',
    ]);
    const session = parseSession(rawSession);

    // 6. RM Information
    const rmCode = findRowValue(row, ['RM Code', 'RMCode', 'RM ID', 'RM_Code', 'Agent Code']);
    const rmName = findRowValue(row, ['RM Name', 'RMName', 'Relationship Manager', 'RM', 'RM_Name', 'Advisor']);
    const rmTeam = findRowValue(row, ['RM Team', 'RMTeam', 'RM Team / Branch', 'Branch', 'Team', 'Location', 'Zone']);

    // 7. AUM Range
    const aumRange = findRowValue(row, ['AUM range', 'AUM Range', 'AUM', 'AUM Tier', 'Portfolio', 'Category']);

    // 8. Accompanying Guest
    let guestName = findRowValue(row, [
        'Accompanying Guest Name',
        'Accompanying Guest',
        'Partner Name',
        'Spouse Name',
        'Guest 2 Name',
        'Second Attendee',
    ]);

    let guestMobile = findRowValue(row, [
        'Accompanying Guest Mobile',
        'Accompanying Guest Phone',
        'Guest Mobile',
        'Guest Phone',
        'Partner Mobile',
    ]);

    // If secondary mobile was extracted from compound phone number, use as guestMobile if not already set
    if (!guestMobile && secondaryContact) {
        guestMobile = secondaryContact;
    }

    // Check if client name contains compound names like "Prashanth R / R Renuka" or "Pavithra Rajan / Prem Anand"
    let clientName = rawName;
    if (!guestName && (clientName.includes(' / ') || clientName.includes(' & ') || clientName.includes(' and '))) {
        const splitParts = clientName.split(/\s*(?:\/|&|\band\b)\s*/i);
        if (splitParts.length >= 2 && splitParts[0].trim() && splitParts[1].trim()) {
            clientName = splitParts[0].trim();
            guestName = splitParts[1].trim();
        }
    }

    const hasAccompanyingGuest = Boolean(guestName && guestName.length > 0);
    const numberOfAttendees = hasAccompanyingGuest ? 2 : 1;

    // 9. Status & Remarks
    const statusRaw = findRowValue(row, ['Check-in Status', 'Check-in', 'Attendance', 'Status']);
    const rawRemarks = findRowValue(row, ['Remarks', 'Notes', 'RM Remarks', 'Comments', 'Special Instructions']);

    const isCheckedIn =
        statusRaw.toLowerCase().includes('check') ||
        statusRaw.toLowerCase().includes('attend') ||
        statusRaw.toLowerCase().includes('yes') ||
        statusRaw.toLowerCase().includes('present');

    // Build remarks with RM & AUM metadata if not explicitly provided
    const remarksParts: string[] = [];
    if (rawRemarks) remarksParts.push(rawRemarks);
    if (aumRange && !rawRemarks.includes(aumRange)) remarksParts.push(`AUM: ${aumRange}`);
    if ((rmName || rmTeam) && !rawRemarks.includes('RM:')) {
        const rmInfo = [rmName, rmTeam].filter(Boolean).join(' - ');
        if (rmInfo) remarksParts.push(`RM: ${rmInfo}`);
    }
    const remarks = remarksParts.length > 0 ? remarksParts.join(' | ') : undefined;

    const id = `ascend-import-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const code = rawCode ? rawCode.toUpperCase().trim() : `K${Math.floor(100000 + Math.random() * 900000)}`;
    const email = rawEmail || `${code.toLowerCase()}@client.aionioncap.com`;

    const attendee: AscendAttendee = {
        id,
        clientName: clientName.trim(),
        clientCode: code,
        contactNumber,
        secondaryContact: secondaryContact || undefined,
        email,
        hasAccompanyingGuest,
        accompanyingGuestName: hasAccompanyingGuest ? guestName.trim() : undefined,
        accompanyingGuestMobile: hasAccompanyingGuest && guestMobile ? guestMobile.trim() : undefined,
        numberOfAttendees,
        rmCode: rmCode || undefined,
        rmName: rmName || undefined,
        rmTeam: rmTeam || undefined,
        aumRange: aumRange || undefined,
        session,
        checkInStatus: isCheckedIn ? 'Checked-in' : 'Registered',
        checkInTimestamp: isCheckedIn ? new Date().toISOString() : undefined,
        remarks,
        registeredAt: new Date().toISOString(),
        qrPayload: `ASCEND-${code}-${id}`,
    };

    return { attendee };
}

/**
 * Automatically inspects all sheets in a workbook and returns the name of the sheet
 * that contains the most relevant Ascend responses/register data.
 */
export function findBestSheet(workbook: XLSX.WorkBook): string {
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) return '';
    if (workbook.SheetNames.length === 1) return workbook.SheetNames[0];

    // Priority keywords in sheet names
    const priorityKeywords = ['responses data', 'responses', 'form responses', 'register', 'clients', 'guests', 'attendees'];

    for (const kw of priorityKeywords) {
        const found = workbook.SheetNames.find(s => s.toLowerCase().includes(kw));
        if (found) return found;
    }

    // Otherwise evaluate each sheet's row count
    let bestSheet = workbook.SheetNames[0];
    let maxRows = 0;

    for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) continue;
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
        if (json.length > maxRows) {
            maxRows = json.length;
            bestSheet = sheetName;
        }
    }

    return bestSheet;
}
