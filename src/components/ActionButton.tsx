"use client";

import Link from "next/link";

interface ActionButtonProps {
  href?: string;
  icon: React.ReactNode;
  title: string;
  color: string;
  onClick?: () => void;
}

export default function ActionButton({
  href,
  icon,
  title,
  color,
  onClick,
}: ActionButtonProps) {
  const button = (
    <button
      className={`w-6 h-6 rounded-full text-sm flex items-center justify-center cursor-pointer ${color ? ` ${color}` : ''}`}
      title={title}
      onClick={onClick}
      type="button"
    >
      {icon}
    </button>
  );

  return href ? <Link href={href}>{button}</Link> : button;
}
