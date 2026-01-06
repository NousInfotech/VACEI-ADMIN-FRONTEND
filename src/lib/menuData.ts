import { 
    DashboardSquare02Icon, 
	InstallingUpdates02Icon,
	UserIcon,
    Briefcase02Icon,
    AddCircleIcon
} from '@hugeicons/core-free-icons';

export interface MenuItem {
    slug: string;
    icon: any; // React component type
    label: string;
    href: string;
    children?: MenuItem[];
}

export const menuData: MenuItem[] = [
    {
        slug: "dashboard",
        icon: DashboardSquare02Icon,
        label: "Dashboard",
        href: "/dashboard",
        children: [],
    },
    {
        slug: "clients",
        icon: UserIcon, // assuming alternative to "fi-rr-users-alt"
        label: "Clients",
        href: "#",
        children: [
            {
                slug: "clients",
                icon: Briefcase02Icon,
                label: "Clients List",
                href: "/dashboard/clients",
            },
            {
                slug: "create",
                icon: AddCircleIcon,
                label: "Create Client",
                href: "/dashboard/clients/create",
            },
        ],
    },
    {
        slug: "accountants",
        icon: UserIcon, 
        label: "Accountants",
        href: "#",
        children: [
            {
                slug: "accountants",
                icon: Briefcase02Icon,
                label: "Accountant Listing",
                href: "/dashboard/accountants",
            },
            {
                slug: "create",
                icon: AddCircleIcon,
                label: "Create Accountant",
                href: "/dashboard/accountants/create",
            },
        ],
    },
    {
        slug: "settings",
        icon: InstallingUpdates02Icon,
        label: "Settings",
        href: "/dashboard/settings",
        children: [],
    },
];
