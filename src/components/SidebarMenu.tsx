"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MenuItem } from "@/lib/menuData";
import { HugeiconsIcon } from '@hugeicons/react';

export default function SidebarMenu({ menu }: { menu: MenuItem[] }) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const pathname = usePathname();

  const toggleItem = (slug: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  return (
    <ul className="menu">
      {menu.map((item) => {
        const hasChildren = Array.isArray(item.children) && item.children.length > 0;
        const isOpen = openItems[item.slug];
        const isActive = pathname === item.href;
        const hasActiveChild = item.children?.some((child) => pathname === child.href);

        return (
          <li
            key={item.slug}
            className={`sidebar-item ${isOpen ? "open" : ""} ${hasChildren ? "has-children" : ""} ${isActive || hasActiveChild ? "active" : ""}`}
          >
            <div className="sidebar-item flex items-center gap-2">
              <Link href={item.href} className="flex-1">
                 <HugeiconsIcon icon={item.icon} className="w-6 h-6" />
                <span className="flex-1">{item.label}</span>
              </Link>
              {hasChildren && (
                <i
                  className={`${isOpen ? "fi fi-br-angle-up" : "fi fi-br-angle-down"} arrows`}
                  onClick={() => toggleItem(item.slug)}
                />
              )}
            </div>

            {hasChildren && isOpen && (
              <ul className="mt-1 space-y-1">
                {item.children?.map((child) => {
                  const isChildActive = pathname === child.href;
                  return (
                    <li key={child.label} className={isChildActive ? "active_submenu" : ""}>
                      <Link
                        href={child.href}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:underline"
                      >
                     <HugeiconsIcon icon={child.icon} className="w-4 h-4" />
                        <span>{child.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
