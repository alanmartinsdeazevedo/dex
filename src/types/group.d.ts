export type Group = {
    groupId: string;
    groupName: string;
    users: string[];
    totalUsers: number;
    isLast: boolean;
    startAt: number;
    maxResults: number;
};

export type GroupList = {
    id: string;
    groupId: string;
    groupName: string;
    description: string;
    order: number;
    createdAt: string;
}

export type GroupUser = {
    accountId: string;
    accountType: string;
    active: boolean;
    displayName: string;
    emailAddress: string;
    self: string;
};