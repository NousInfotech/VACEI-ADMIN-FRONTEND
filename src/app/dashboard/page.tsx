// pages/dashboard/index.tsx

"use client";
import { getDecodedUsername } from "@/utils/authUtils";
import Link from "next/link";
import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
// Import the single, unified API function
import { fetchDashboardStats } from "@/api/dashboardService"; // Adjust this path if dashboardService.ts contains the request function and fetchDashboardStats

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  // NEW: State variables for total clients and accountants
  const [totalClients, setTotalClients] = useState<number | null>(null);
  const [totalAccountants, setTotalAccountants] = useState<number | null>(null);

  useEffect(() => {
    const getDashboardData = async () => {
      setLoading(true); // Ensure loading is true before fetch starts
      try {
        // Fetch only clients and accountants now
        const data = await fetchDashboardStats(); // This will return { totalClients, totalAccountants }

        setTotalClients(data.totalClients);
        setTotalAccountants(data.totalAccountants);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        // Set to 0 or handle error display gracefully if data fetching fails
        setTotalClients(0);
        setTotalAccountants(0);
      } finally {
        setLoading(false); // Set loading to false after fetch, regardless of success or failure
      }
    };

    getDashboardData(); // Call the function to fetch data on component mount
  }, []); // Empty dependency array means this runs once on mount

  const handleContactAccountantClick = () => {
    const chatBubbleButton = document.getElementById("openChatBubble");
    if (chatBubbleButton) {
      chatBubbleButton.click();
    }
  };

  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5">
      <div className="bg-white border border-main rounded-[10px] px-5 py-6">
        <h1 className="text-[32px] font-medium mb-8 leading-normal">
          Welcome back, {getDecodedUsername()}
        </h1>

        <div className="flex flex-wrap items-center lg:gap-10 gap-5 mb-12">
          <button
            style={{ display: "none" }}
            className="bg-cream flex gap-2.5 border border-main text-[#3D3D3D] py-3 px-5 rounded-lg font-medium cursor-pointer"
          >
            <i className="fi fi-rr-code-pull-request text-[22px] block leading-0"></i> New Service
            Request
          </button>
          <button
            style={{ display: "none" }}
            className="bg-cream flex gap-2.5 border border-main text-[#3D3D3D] py-3 px-5 rounded-lg font-medium cursor-pointer"
          >
            <i className="fi fi-rr-settings text-[22px] block leading-0"></i> Request Upgrade
          </button>
        </div>

        <div className="mb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Clients Card */}
            <StatCard
              title="Clients"
              // Pass the fetched totalClients, converting to string or default to "0"
              amount={totalClients !== null ? totalClients.toString() : "0"}
              change="+2" // Keep static or fetch dynamic change if available
              note="Total clients overall"
              bgColor="#D9E5FF" // Example background color
              link="/dashboard/clients" // Optional: Link to a clients page
              loading={loading} // Pass the loading state to StatCard
            />

            {/* Accountants Card */}
            <StatCard
              title="Accountants"
              // Pass the fetched totalAccountants, converting to string or default to "0"
              amount={totalAccountants !== null ? totalAccountants.toString() : "0"}
              change="+5" // Keep static or fetch dynamic change if available
              note="Total accountants overall"
              bgColor="#DCFFD9" // Example background color
              link="/dashboard/accountants" // Optional: Link to an accountants page
              loading={loading} // Pass the loading state to StatCard
            />
          </div>
        </div>
      </div>
    </section>
  );
}