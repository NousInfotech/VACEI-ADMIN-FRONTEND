"use client";

import { useState, Suspense } from "react";
import AssignClients from "../components/AssignClients";
import ListingAssignments from "../components/ListingAssignments";
import Breadcrumb from "@/components/Breadcrumb";

function AssignmentContent() {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <section className="mx-auto max-w-[1400px] w-full pt-5">
            <Breadcrumb />
            <div className="bg-white border border-gray-200 rounded-[10px] px-5 py-6 overflow-hidden">
                <h1 className="text-2xl font-medium pb-5 border-b border-gray-200">Assign Clients</h1>
                <div className="bg-white shadow p-6 mt-5">
                    <AssignClients onAssigned={handleRefresh} />
                </div>
                <h1 className="text-2xl font-medium pb-5 border-b border-gray-200 mt-5">Assignments</h1>
                  <div className="bg-white shadow  mt-5">
                <ListingAssignments refreshKey={refreshKey} />
                </div>
            </div>
        </section>
    );
}

export default function Assignment() {
    return (
        <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
            <AssignmentContent />
        </Suspense>
    );
}
