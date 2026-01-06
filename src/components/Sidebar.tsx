"use client";

import Link from "next/link";
import Image from "next/image";
import SidebarMenu from "@/components/SidebarMenu";
import { menuData } from "@/lib/menuData";
import UserMenu from "@/components/UserMenu";

export default function Sidebar() {

    return (
        <>
            <section
                className="sidebar sticky top-0 flex-col shrink-0 hidden lg:flex w-64 bg-white border border-main rounded-[10px] overflow-hidden">
                <div className="navigation logo p-4">
                    <Link href="/dashboard">
                        <Image
                            src="/logo-icon.png"
                            alt="Logo"
                            width={40}
                            height={40}
                        />
                    </Link>
                </div>

                <div className="scrollarea grow">
                    <SidebarMenu menu={menuData}/>
                    <hr className="divider mt-2"/>
                </div>

                <UserMenu/>
            </section>
        </>
    );
}
