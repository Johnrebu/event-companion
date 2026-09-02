import { useState, useEffect, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { AscendAttendee, RegistrationFormData, AscendSession, CheckInStatus } from '@/types/ascend';
import { parseAscendRow } from '@/utils/ascendExcelParser';

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

    // Delete multiple attendees
    const deleteMultipleAttendees = useCallback((ids: string[]) => {
        const idSet = new Set(ids);
        setAttendees((prev) => prev.filter((item) => !idSet.has(item.id)));
    }, []);

    // Bulk Import Excel / CSV
    const importFromParsedRows = useCallback((
        rows: Array<Record<string, any>>,
        mode: 'append' | 'replace' = 'append'
    ): { importedCount: number; errors: string[] } => {
        const importedList: AscendAttendee[] = [];
        const errors: string[] = [];

        rows.forEach((row, index) => {
            const result = parseAscendRow(row, index);
            if (result.error) {
                errors.push(result.error);
            }
            if (result.attendee) {
                importedList.push(result.attendee);
            }
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
            'RM CODE': a.rmCode || '-',
            'RM NAME': a.rmName || '-',
            'RM TEAM / BRANCH': a.rmTeam || '-',
            'AUM RANGE': a.aumRange || '-',
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
            { wch: 14 }, // RM Code
            { wch: 20 }, // RM Name
            { wch: 20 }, // RM Team
            { wch: 20 }, // AUM Range
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
                'Client Name': 'Sathish Bhargavi',
                'ClientPhoneNumer': '9962542048',
                'ClientEmailId': 'dsathish2u@gmail.com',
                'ClientCode': 'B000591',
                'Which session would you prefer to attend?': 'Evening Session - Timing: 6:00 PM - 9:00 PM',
                'RM Code': 'ACM0154',
                'RM Name': 'Alamelu S',
                'RM Team': 'Royapettah 1',
                'AUM range': '50 Lakhs to 1 Crore',
            },
            {
                'Client Name': 'VIGNESHRAJ JAIRAJ',
                'ClientPhoneNumer': '9445126676',
                'ClientEmailId': 'vigneshraj.4@gmail.com',
                'ClientCode': 'V001134',
                'Which session would you prefer to attend?': 'Morning Session - Timing: 10:00 AM - 1:00 PM',
                'RM Code': 'ACM0154',
                'RM Name': 'Hari Haran',
                'RM Team': 'Coimbatore',
                'AUM range': 'Up to 1 Lakh',
            },
            {
                'Client Name': 'Prashanth R / R Renuka',
                'ClientPhoneNumer': '8681954435/9940050467',
                'ClientEmailId': 'renu1972car@gmail.com',
                'ClientCode': 'R000909',
                'Which session would you prefer to attend?': 'Morning Session - Timing: 10:00 AM - 1:00 PM',
                'RM Code': 'ACM0190',
                'RM Name': 'Santhosh U',
                'RM Team': 'Coimbatore',
                'AUM range': '50 Lakhs to 1 Crore',
            },
        ];

        const worksheet = XLSX.utils.json_to_sheet(sampleRows);
        worksheet['!cols'] = [
            { wch: 26 },
            { wch: 24 },
            { wch: 28 },
            { wch: 14 },
            { wch: 45 },
            { wch: 14 },
            { wch: 20 },
            { wch: 18 },
            { wch: 24 },
        ];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Responses Data');
        XLSX.writeFile(workbook, 'The_Aionion_Ascend_Responses_Template.xlsx');
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
        deleteMultipleAttendees,
        importFromParsedRows,
        exportToExcel,
        downloadSampleTemplate,
        resetToDemoData,
        clearAll,
    };
}
