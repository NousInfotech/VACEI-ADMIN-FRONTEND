"use client";

import {useState} from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import Image from "next/image";
import SidebarMenu from "@/components/SidebarMenu";
import {menuData} from "@/lib/menuData";
import UserMenu from "@/components/UserMenu";
import TopHeader from "@/components/TopHeader";

export default function DashboardLayout({children}: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <>
            <div className="max-w-[400px] w-1/2 w-[400px] h-[400px] bg-[#B6FFAF] blur-[150px] fixed top-0 left-0"></div>
            <div
                className="max-w-[400px] w-1/2 w-[400px] h-[400px] -rotate-180 bg-[#AFF7FF] blur-[150px] fixed top-0 right-0"></div>
            <div
                className="max-w-[400px] w-1/2 w-[400px] h-[400px] bg-[#B5AFFF] blur-[150px] fixed bottom-0 left-0"></div>
            <div
                className="max-w-[400px] w-1/2 w-[400px] h-[400px] -rotate-180 bg-[#FFF8AF] blur-[150px] fixed bottom-0 right-0"></div>
            <div className="p-5 relative">

                {/* Header for mobile */}
                <header
                    className="lg:hidden sticky top-0 bg-white border border-main rounded-[10px] flex justify-between items-center px-4 py-5 z-10 w-full mb-5">
                    <Link href="/dashboard">
                        <Image
                            src="/logo.svg"
                            alt="Logo"
                            width={120}
                            height={100}
                        />
                    </Link>
                    <button
                        className="text-black text-2xl "
                        aria-label="Open sidebar"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <i className="fi fi-rr-menu-burger block leading-0"></i>
                    </button>
                </header>

                {/* Offcanvas Sidebar for mobile */}
                <div
                    className={`fixed inset-y-0 right-0 top-2 z-50 w-4/6 bg-white shadow-lg transform transition-transform duration-300 ease-in-out overflow-auto h-[98%] rounded-[10px] bg-cream border border-main lg:hidden ${isSidebarOpen ? "-translate-x-2" : "translate-x-full"
                    }`}
                >
                    <div className="flex justify-between items-center p-4 bg-cream">
                        <Link href="/dashboard">
                            <Image
                                src="/logo.svg"
                                alt="Logo"
                                width={120}
                                height={100}
                            />
                        </Link>
                        <button
                            className="text-black text-xl"
                            aria-label="Close sidebar"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <i className="fi fi-rr-cross"></i>
                        </button>
                    </div>

                    <div className="flex flex-col shrink-0 overflow-scroll min-h-[95vh]">
                        <div className="scrollarea grow overflow-scroll">
                            <SidebarMenu menu={menuData}/>
                            <hr className="divider mt-2"/>
                        </div>
                        <UserMenu/>
                    </div>
                </div>

                {/* Desktop layout */}
                <div className="flex">
                    <Sidebar/>
                    <main className="flex-1 flex flex-col lg:pe-0 lg:px-5 pt-0">
                        <div className="flex-1 pb-8 min-h-[90vh]">
                            <TopHeader/>
                            {children}
                        </div>

                        <footer
                            className="mt-auto bg-white border border-main rounded-[10px] text-black text-center py-2 text-[14px]">
                             &copy; {new Date().getFullYear()} Vacei. All rights reserved.
                        </footer>
                    </main>
                </div>

                {/* Backdrop for mobile */}
                {isSidebarOpen && (
                    <div className="fixed inset-0 bg-overlay z-40 lg:hidden"
                         onClick={() => setIsSidebarOpen(false)}></div>
                )}

            </div>
        </>
    );
}
