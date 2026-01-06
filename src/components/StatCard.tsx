import Link from 'next/link';
import React from 'react'; // Don't forget to import React if using React.FC or similar types

// This iconMap will now serve as a fallback if iconClass is not directly passed
const iconMap: { [key: string]: string } = {
  'Clients': 'users-alt', // Icon for Clients
  'Documents': 'document', // Icon for Documents
  'Accountants': 'users-alt', // Icon for Accountants
};

// Define the props interface clearly
interface StatCardProps {
  title: string;
  amount: string;
  change: string;
  note: string;
  bgColor: string; // bgColor is required as per your DashboardPage's processing
  iconClass?: string; // iconClass can be optional if not all stats have one
  link?: string | null; // Make link explicitly string or null/undefined
  loading?: boolean; // NEW: Optional prop for loading state
}

// Apply the interface to the function component's props
export default function StatCard({
  title,
  amount,
  change,
  note,
  bgColor,
  iconClass,
  link = null, // Change default value to null or undefined
  loading = false, // NEW: Default loading to false
}: StatCardProps) {

  // --- NEW: Conditional rendering for the loading skeleton ---
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-[10px] p-5 animate-pulse min-h-[150px] flex flex-col justify-between">
        {/* Skeleton for the icon and text header */}
        <div className="flex items-center gap-3 mb-[46px]">
          <div className="bg-gray-300 rounded-full w-10 h-10"></div> {/* Icon placeholder */}
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div> {/* Title placeholder */}
            <div className="h-3 bg-gray-200 rounded w-32"></div> {/* Note placeholder */}
          </div>
        </div>
        {/* Skeleton for the amount */}
        <div className="h-8 bg-gray-300 rounded w-1/2 mb-3"></div>
        {/* Skeleton for the change/compare note (optional, if you want it) */}
        <div className="h-4 bg-gray-200 rounded w-3/4" style={{ display: "none" }}></div>
      </div>
    );
  }

  // --- Original StatCard content (rendered when NOT loading) ---
  const isPositive = change.startsWith('+');

  // Determine the icon to use: prioritize iconClass from props, then fallback to iconMap
  const finalIcon = iconClass || iconMap[title];

  const cardContent = (
    <div
      className="rounded-[10px] p-5 w-full"
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex items-center gap-3 mb-[46px]">
        <div
          className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center flex-col">
          {/* Only render the icon if finalIcon is a truthy value (i.e., not undefined or empty string) */}
          {finalIcon && (
            <i className={`fr fi-rr-${finalIcon} text-2xl leading-0 block`} />
          )}
        </div>
        <div>
          <h3 className="text-2xl font-medium text-dark block mb-1.5 leading-6">{title}</h3>
          <p className="text-base text-[#3D3D3D] font-normal block leading-4">{note}</p>
        </div>
      </div>
      <span className="text-[32px] block font-semibold text-dark leading-10 mb-3">{amount}</span>
      <p style={{ display: "none" }} className={`text-base flex items-center font-normal ${isPositive ? 'text-[#10AA02]' : 'text-[#E53933]'}`}>
        <i className={`fi ${isPositive ? 'fi-rr-arrow-small-up' : 'fi-rr-arrow-small-down'} leading-0 block`}></i>
        {change}
        <span className="text-[#3D3D3D] ps-1">Compare to last month</span>
      </p>
    </div>
  );

  // Conditionally render the Link component
  return link ? (
    <Link href={link}>
      {cardContent}
    </Link>
  ) : (
    cardContent
  );
}