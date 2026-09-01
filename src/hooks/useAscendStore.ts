import { useState, useEffect, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { AscendAttendee, RegistrationFormData, AscendSession, CheckInStatus } from '@/types/ascend';

const STORAGE_KEY = 'aionion-ascend-attendees-v1';

// Initial seed data adhering strictly to prompt examples and real-world corporate guest register standards
const INITIAL_SEED_ATTENDEES: AscendAttendee[] = [
    {
        id: 'ascend-001',
        clientName: 'Priya Ramanathan',
        clientCode: 'K000773',
        contactNumber: '9840123456',
        email: 'priya.ramanathan@aionioncap.com',
        hasAccompanyingGuest: true,
        accompanyingGuestName: 'Arvind Ramanathan',
        accompanyingGuestMobile: '9840987654',
        numberOfAttendees: 2,
        rmCode: 'RM-011',
        rmName: 'Suresh Balakrishnan',
        rmTeam: 'Royapettah 5',
        session: 'Morning Gathering',
        checkInStatus: 'Checked-in',
        checkInTimestamp: '2026-08-23T09:12:44.000Z',
        remarks: 'VIP Client - Front Row Seating Preferred',
        registeredAt: '2026-08-10T11:20:00.000Z',
        qrPayload: 'ASCEND-K000773-ascend-001',
    },
    {
        id: 'ascend-002',
        clientName: 'Rajesh Narayanan',
        clientCode: 'K000842',
        contactNumber: '9940567890',
        email: 'rajesh.narayanan@chennaiventures.in',
        hasAccompanyingGuest: false,
        numberOfAttendees: 1,
        rmCode: 'RM-014',
        rmName: 'Ananya Deshmukh',
        rmTeam: 'Alwarpet',
        session: 'Morning Gathering',
        checkInStatus: 'Registered',
        remarks: 'Confirmed attendance via RM call',
        registeredAt: '2026-08-11T14:45:00.000Z',
        qrPayload: 'ASCEND-K000842-ascend-002',
    },
    {
        id: 'ascend-003',
        clientName: 'Dr. Meenakshi Sundaram',
        clientCode: 'K000915',
        contactNumber: '9884123890',
        email: 'drmeena.sundaram@medisurge.org',
        hasAccompanyingGuest: true,
        accompanyingGuestName: 'Dr. R. Sundaram',
        accompanyingGuestMobile: '9884567123',
        numberOfAttendees: 2,
        rmCode: 'RM-022',
        rmName: 'Karthik Subramanian',
        rmTeam: 'Anna Nagar',
        session: 'Evening Gathering',
        checkInStatus: 'Checked-in',
        checkInTimestamp: '2026-08-23T16:18:22.000Z',
        remarks: 'Keynote Panelist Guest',
        registeredAt: '2026-08-12T09:30:00.000Z',
        qrPayload: 'ASCEND-K000915-ascend-003',
    },
    {
        id: 'ascend-004',
        clientName: 'Venkatesh Raghavan',
        clientCode: 'K000629',
        contactNumber: '9790884433',
        email: 'venkat.raghavan@dynatech.com',
        hasAccompanyingGuest: false,
        numberOfAttendees: 1,
        rmCode: 'RM-035',
        rmName: 'Meera Venkatesh',
        rmTeam: 'Nungambakkam',
        session: 'Evening Gathering',
        checkInStatus: 'Registered',
        remarks: 'Dietary: Vegetarian',
        registeredAt: '2026-08-13T16:10:00.000Z',
        qrPayload: 'ASCEND-K000629-ascend-004',
    },
    {
        id: 'ascend-005',
        clientName: 'Siddharth Chandrasekhar',
        clientCode: 'K001048',
        contactNumber: '9841029384',
        email: 'siddharth@apexfin.co',
        hasAccompanyingGuest: true,
        accompanyingGuestName: 'Kavitha Chandrasekhar',
        accompanyingGuestMobile: '9841883322',
        numberOfAttendees: 2,
        rmCode: 'RM-048',
        rmName: 'Vikram Sundaram',
        rmTeam: 'Adyar Private Wealth',
        session: 'Morning Gathering',
        checkInStatus: 'Registered',
        remarks: 'Requested valet parking assistance',
        registeredAt: '2026-08-14T10:05:00.000Z',
        qrPayload: 'ASCEND-K001048-ascend-005',
    },
    {
        id: 'ascend-006',
        clientName: 'Anandhi Sivakumar',
        clientCode: 'K000512',
        contactNumber: '9840887766',
        email: 'anandhi.siva@greenhorizon.io',
        hasAccompanyingGuest: false,
        numberOfAttendees: 1,
        rmCode: 'RM-059',
        rmName: 'Pooja Ramanathan',
        rmTeam: 'T. Nagar',
        session: 'Evening Gathering',
        checkInStatus: 'Registered',
        remarks: 'New Portfolio Onboarding 2026',
        registeredAt: '2026-08-15T15:20:00.000Z',
        qrPayload: 'ASCEND-K000512-ascend-006',
    },
];

export function useAscendStore() {
    const [attendees, setAttendees] = useState<AscendAttendee[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initialize from localStorage or fallback to initial seed
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setAttendees(parsed);
                } else {
                    setAttendees(INITIAL_SEED_ATTENDEES);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_ATTENDEES));
                }
            } else {
                setAttendees(INITIAL_SEED_ATTENDEES);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_ATTENDEES));
            }
        } catch (err) {
            console.error('Failed to load Ascend attendees from storage:', err);
            setAttendees(INITIAL_SEED_ATTENDEES);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save to localStorage on state changes
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(attendees));
            } catch (err) {
                console.error('Failed to save Ascend attendees:', err);
            }
        }
    }, [attendees, isLoaded]);

    // Register a new client following strictly the 5-step requirements
    const registerClient = useCallback((formData: RegistrationFormData): AscendAttendee => {
        const id = `ascend-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
        const cleanCode = formData.clientCode.trim().toUpperCase();
        const attendeeCount = formData.hasAccompanyingGuest ? 2 : 1;
        const qrPayload = `ASCEND-${cleanCode || 'GUEST'}-${id}`;

        const newAttendee: AscendAttendee = {
            id,
            clientName: formData.clientName.trim(),
            clientCode: cleanCode,
            contactNumber: formData.contactNumber.trim(),
            email: formData.email.trim().toLowerCase(),
            hasAccompanyingGuest: formData.hasAccompanyingGuest,
            accompanyingGuestName: formData.hasAccompanyingGuest ? formData.accompanyingGuestName.trim() : undefined,
            accompanyingGuestMobile: formData.hasAccompanyingGuest && formData.accompanyingGuestMobile ? formData.accompanyingGuestMobile.trim() : undefined,
            numberOfAttendees: attendeeCount,
            rmCode: formData.rmCode?.trim(),
            rmName: formData.rmName?.trim(),
            rmTeam: formData.rmTeam?.trim(),
            session: formData.session || 'Morning Gathering',
            checkInStatus: 'Registered',
            remarks: formData.remarks?.trim(),
            registeredAt: new Date().toISOString(),
            qrPayload,
        };

        setAttendees((prev) => [newAttendee, ...prev]);
        return newAttendee;
    }, []);

    // Toggle check-in status
    const toggleCheckIn = useCallback((id: string) => {
        let updatedItem: AscendAttendee | null = null;
        setAttendees((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    const isCheckedIn = item.checkInStatus === 'Checked-in';
                    updatedItem = {
                        ...item,
                        checkInStatus: isCheckedIn ? 'Registered' : 'Checked-in',
                        checkInTimestamp: isCheckedIn ? undefined : new Date().toISOString(),
                    };
                    return updatedItem;
                }
                return item;
            })
        );
        return updatedItem;
    }, []);

    // Fast check-in by Client Code or QR Payload
    const checkInByCodeOrPayload = useCallback((query: string): { success: boolean; attendee?: AscendAttendee; message: string } => {
        const trimmed = query.trim().toUpperCase();
        if (!trimmed) return { success: false, message: 'Please enter or scan a code.' };

        const match = attendees.find((a) =>
            a.clientCode.toUpperCase() === trimmed ||
            a.qrPayload.toUpperCase() === trimmed ||
            a.id.toUpperCase() === trimmed ||
            a.contactNumber.includes(trimmed)
        );

        if (!match) {
            return { success: false, message: `No guest found matching "${query}".` };
        }

        if (match.checkInStatus === 'Checked-in') {
            return {
                success: true,
                attendee: match,
                message: `${match.clientName} (${match.clientCode}) is already checked in at ${new Date(match.checkInTimestamp || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
            };
        }

        const now = new Date().toISOString();
        const updated = {
            ...match,
            checkInStatus: 'Checked-in' as CheckInStatus,
            checkInTimestamp: now,
        };

        setAttendees((prev) => prev.map((a) => (a.id === match.id ? updated : a)));

        return {
            success: true,
            attendee: updated,
            message: `Check-in successful! Welcome ${match.clientName} (${match.numberOfAttendees} attendee${match.numberOfAttendees > 1 ? 's' : ''}).`,
        };
    }, [attendees]);

    // Update attendee record
    const updateAttendee = useCallback((updated: AscendAttendee) => {
        setAttendees((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    }, []);

    // Delete attendee
    const deleteAttendee = useCallback((id: string) => {
        setAttendees((prev) => prev.filter((item) => item.id !== id));
    }, []);

    // Bulk Import Excel / CSV
    const importFromParsedRows = useCallback((
        rows: Array<Record<string, any>>,
        mode: 'append' | 'replace' = 'append'
    ): { importedCount: number; errors: string[] } => {
        const importedList: AscendAttendee[] = [];
        const errors: string[] = [];

        rows.forEach((row, index) => {
            // Flexible header key lookup
            const getVal = (...keys: string[]): string => {
                for (const k of keys) {
                    for (const rowKey of Object.keys(row)) {
                        if (rowKey.trim().toLowerCase() === k.toLowerCase()) {
                            const val = row[rowKey];
                            return val !== undefined && val !== null ? String(val).trim() : '';
                        }
                    }
                }
                return '';
            };

            const clientName = getVal('Client Name', 'Name', 'Client', 'Guest Name');
            const clientCode = getVal('Client Code', 'Code', 'Client ID', 'ID');
            const contactNumber = getVal('Contact Number', 'Client Phone Number', 'Client Phone Number / Mobile', 'Mobile Number', 'Phone Number', 'Phone', 'Mobile');
            const email = getVal('Email ID', 'Email', 'Email Address');
            const guestName = getVal('Accompanying Guest Name', 'Guest Name', 'Accompanying Guest', 'Partner Name');
            const guestMobile = getVal('Accompanying Guest Mobile', 'Guest Mobile', 'Guest Phone');
            const rmName = getVal('RM Name', 'Relationship Manager', 'RM');
            const rmCode = getVal('RM Code', 'RM ID');
            const rmTeam = getVal('RM Team', 'RM Team / Branch', 'Branch', 'Team');
            const sessionRaw = getVal('Session', 'Session Type', 'Gathering');
            const statusRaw = getVal('Check-in Status', 'Check-in', 'Status');
            const remarks = getVal('Remarks', 'Notes', 'RM Remarks');

            if (!clientName && !clientCode) {
                // Skip empty row
                return;
            }

            if (!clientName) {
                errors.push(`Row ${index + 2}: Missing Client Name`);
                return;
            }

            const hasGuest = Boolean(guestName && guestName.length > 0);
            let session: AscendSession = 'Morning Gathering';
            if (sessionRaw.toLowerCase().includes('evening') || sessionRaw.toLowerCase().includes('night') || sessionRaw.toLowerCase().includes('dinner')) {
                session = 'Evening Gathering';
            } else if (sessionRaw.toLowerCase().includes('general') || sessionRaw.toLowerCase().includes('all')) {
                session = 'General';
            }

            const id = `ascend-import-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
            const code = clientCode.toUpperCase() || `K${Math.floor(100000 + Math.random() * 900000)}`;

            importedList.push({
                id,
                clientName,
                clientCode: code,
                contactNumber: contactNumber.replace(/\D/g, '').slice(-10) || '9840000000',
                email: email || `${code.toLowerCase()}@client.aionioncap.com`,
                hasAccompanyingGuest: hasGuest,
                accompanyingGuestName: hasGuest ? guestName : undefined,
                accompanyingGuestMobile: hasGuest && guestMobile ? guestMobile : undefined,
                numberOfAttendees: hasGuest ? 2 : 1,
                rmCode: rmCode || undefined,
                rmName: rmName || undefined,
                rmTeam: rmTeam || undefined,
                session,
                checkInStatus: statusRaw.toLowerCase().includes('check') || statusRaw.toLowerCase().includes('attend') ? 'Checked-in' : 'Registered',
                checkInTimestamp: statusRaw.toLowerCase().includes('check') ? new Date().toISOString() : undefined,
                remarks: remarks || (rmName || rmTeam ? `RM: ${[rmName, rmTeam].filter(Boolean).join(' - ')}` : undefined),
                registeredAt: new Date().toISOString(),
                qrPayload: `ASCEND-${code}-${id}`,
            });
        });

        if (mode === 'replace') {
            setAttendees(importedList);
        } else {
            setAttendees((prev) => [...prev, ...importedList]);
        }

        return { importedCount: importedList.length, errors };
    }, []);

    // Export current guest register to Corporate Standard Excel (.xlsx)
    const exportToExcel = useCallback((filename = 'The_Aionion_Ascend_Guest_Register.xlsx') => {
        const exportData = attendees.map((a, idx) => ({
            'S.NO': idx + 1,
            'NAME': a.clientName,
            'CLIENT CODE': a.clientCode,
            'CONTACT NUMBER': a.contactNumber,
            'EMAIL': a.email,
            'GUEST NAME': a.accompanyingGuestName || 'None',
            'NO. OF ATTENDEES': a.numberOfAttendees,
            'SESSION': a.session,
            'CHECK-IN STATUS': a.checkInStatus,
            'CHECK-IN TIME': a.checkInTimestamp ? new Date(a.checkInTimestamp).toLocaleString('en-IN') : '-',
            'RM NAME': a.rmName || '-',
            'RM TEAM / BRANCH': a.rmTeam || '-',
            'REMARKS': a.remarks || '-',
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        // Style column widths
        worksheet['!cols'] = [
            { wch: 6 },  // S.No
            { wch: 24 }, // Name
            { wch: 14 }, // Client Code
            { wch: 16 }, // Contact
            { wch: 28 }, // Email
            { wch: 22 }, // Guest Name
            { wch: 16 }, // No. of Attendees
            { wch: 20 }, // Session
            { wch: 16 }, // Status
            { wch: 22 }, // Check-in Time
            { wch: 20 }, // RM Name
            { wch: 20 }, // RM Team
            { wch: 30 }, // Remarks
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Ascend Register');
        XLSX.writeFile(workbook, filename);
    }, [attendees]);

    // Download Sample Import Template
    const downloadSampleTemplate = useCallback(() => {
        const sampleRows = [
            {
                'Client Name': 'Priya Ramanathan',
                'Client Code': 'K000773',
                'Client Phone Number / Mobile': '9840123456',
                'Email': 'priya.ramanathan@example.com',
                'Accompanying Guest Name': 'Arvind Ramanathan',
                'Accompanying Guest Mobile': '9840987654',
                'RM Name': 'Suresh Balakrishnan',
                'RM Team': 'Royapettah 5',
                'Session': 'Morning Gathering',
                'Remarks': 'VIP Seat Request',
            },
            {
                'Client Name': 'Rajesh Narayanan',
                'Client Code': 'K000842',
                'Client Phone Number / Mobile': '9940567890',
                'Email': 'rajesh.narayanan@example.com',
                'Accompanying Guest Name': '',
                'Accompanying Guest Mobile': '',
                'RM Name': 'Ananya Deshmukh',
                'RM Team': 'Alwarpet',
                'Session': 'Morning Gathering',
                'Remarks': 'Confirmed via call',
            },
            {
                'Client Name': 'Dr. Meenakshi Sundaram',
                'Client Code': 'K000915',
                'Client Phone Number / Mobile': '9884123890',
                'Email': 'meenakshi.s@example.com',
                'Accompanying Guest Name': 'Dr. R. Sundaram',
                'Accompanying Guest Mobile': '9884567123',
                'RM Name': 'Karthik Subramanian',
                'RM Team': 'Anna Nagar',
                'Session': 'Evening Gathering',
                'Remarks': 'Panelist',
            },
        ];

        const worksheet = XLSX.utils.json_to_sheet(sampleRows);
        worksheet['!cols'] = [
            { wch: 22 },
            { wch: 14 },
            { wch: 26 },
            { wch: 28 },
            { wch: 24 },
            { wch: 24 },
            { wch: 20 },
            { wch: 18 },
            { wch: 20 },
            { wch: 22 },
        ];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Import Template');
        XLSX.writeFile(workbook, 'The_Aionion_Ascend_Sample_Import_Template.xlsx');
    }, []);

    // Reset back to initial seed data
    const resetToDemoData = useCallback(() => {
        setAttendees(INITIAL_SEED_ATTENDEES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_ATTENDEES));
    }, []);

    // Clear all attendees
    const clearAll = useCallback(() => {
        setAttendees([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    // Real-time calculated stats
    const stats = useMemo(() => {
        const totalRegisteredClients = attendees.length;
        const totalExpectedAttendees = attendees.reduce((sum, a) => sum + (a.numberOfAttendees || 1), 0);
        const checkedInClients = attendees.filter((a) => a.checkInStatus === 'Checked-in').length;
        const checkedInAttendees = attendees
            .filter((a) => a.checkInStatus === 'Checked-in')
            .reduce((sum, a) => sum + (a.numberOfAttendees || 1), 0);

        const morningClients = attendees.filter((a) => a.session === 'Morning Gathering');
        const morningAttendees = morningClients.reduce((sum, a) => sum + (a.numberOfAttendees || 1), 0);
        const morningCheckedIn = morningClients
            .filter((a) => a.checkInStatus === 'Checked-in')
            .reduce((sum, a) => sum + (a.numberOfAttendees || 1), 0);

        const eveningClients = attendees.filter((a) => a.session === 'Evening Gathering');
        const eveningAttendees = eveningClients.reduce((sum, a) => sum + (a.numberOfAttendees || 1), 0);
        const eveningCheckedIn = eveningClients
            .filter((a) => a.checkInStatus === 'Checked-in')
            .reduce((sum, a) => sum + (a.numberOfAttendees || 1), 0);

        const checkInPercentage = totalExpectedAttendees > 0
            ? Math.round((checkedInAttendees / totalExpectedAttendees) * 100)
            : 0;

        return {
            totalRegisteredClients,
            totalExpectedAttendees,
            checkedInClients,
            checkedInAttendees,
            pendingAttendees: totalExpectedAttendees - checkedInAttendees,
            morningAttendees,
            morningCheckedIn,
            eveningAttendees,
            eveningCheckedIn,
            checkInPercentage,
        };
    }, [attendees]);

    return {
        attendees,
        isLoaded,
        stats,
        registerClient,
        toggleCheckIn,
        checkInByCodeOrPayload,
        updateAttendee,
        deleteAttendee,
        importFromParsedRows,
        exportToExcel,
        downloadSampleTemplate,
        resetToDemoData,
        clearAll,
    };
}
