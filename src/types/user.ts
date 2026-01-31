export type Role = 'manager' | 'member';

export interface User {
    id: string;
    name: string;
    role: Role;
}

export const TEAM_MEMBERS: User[] = [
    { id: 'naveen', name: 'Naveen Kumar', role: 'manager' },
    { id: 'johnson', name: 'Johnson', role: 'member' },
    { id: 'kavya', name: 'Kavya', role: 'member' },
];
