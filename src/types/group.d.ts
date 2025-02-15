import { GroupList } from '@/src/types/group';
export type Group = {
    users: string[];
    total: number;
    totalUsers: number;
    isLast: boolean;
    startAt: number;
    maxResults: number;
};

export type GroupList = {
    values: GroupValues[], 
    startAt: number, 
    maxResults: number, 
    total: number, 
    isLast: boolean
}

export type GroupValues = {
    name: string;
    groupId: string;
}

export type GroupUser = {
    accountId: string;
    accountType: string;
    active: boolean;
    displayName: string;
    emailAddress: string;
    self: string;
};

export type GroupSelectList = {
    id: string;
    groupId: string;
    groupName: string;
    description: string;
    order: number;
    createdAt: string;
}

export type User = {
    accountId: string;
    accountType: string;
    active: boolean;
    displayName: string;
    emailAddress: string;
    self: string;
};