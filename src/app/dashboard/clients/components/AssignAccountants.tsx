"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAlert } from "@/app/context/AlertContext";

interface User {
  id: string;
  username: string;
  email: string;
}

interface Service {
  serviceCode: string;
  name: string;
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-300 rounded-md ${className}`} />
);

export default function AssignAccountant({ onAssigned }: { onAssigned: () => void }) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAlert } = useAlert();

  const encodedClientId = searchParams.get("id");
  const encodedAssignmentId = searchParams.get("aid");

  let clientId: string | null = null;
  let assignmentId: string | null = null;

  try {
    clientId = encodedClientId ? atob(encodedClientId) : null;
  } catch {
    clientId = null;
  }

  try {
    assignmentId = encodedAssignmentId ? atob(encodedAssignmentId) : null;
  } catch {
    assignmentId = null;
  }

  const isEditing = !!assignmentId;

  const [submitting, setSubmitting] = useState(false);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [accountants, setAccountants] = useState<User[]>([]);
  const [selectedAccountant, setSelectedAccountant] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [prefilledServices, setPrefilledServices] = useState<string[]>([]);
  const [client, setClient] = useState<User | null>(null);

  const [loadingAccountants, setLoadingAccountants] = useState(true);
  const [loadingClient, setLoadingClient] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [prefilling, setPrefilling] = useState(false);

  const [accountantError, setAccountantError] = useState("");
  const [servicesError, setServicesError] = useState("");

  const [clientIdError, setClientIdError] = useState<string | null>(null);
  const [assignmentIdError, setAssignmentIdError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";

    if (!clientId) {
      setClientIdError("Invalid or missing client ID.");
      setClient(null);
      setAvailableServices([]);
      setLoadingClient(false);
    } else {
      setClientIdError(null);
      (async () => {
        setLoadingClient(true);
        try {
          const res = await fetch(`${backendUrl}user/${clientId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          if (!res.ok) throw new Error("Client not found.");
          const data = await res.json();
          if (!data || !data.id) throw new Error("Client not found.");
          setClient(data);
        } catch (err) {
          console.error(err);
          setClient(null);
          setClientIdError("Client not found or invalid client ID.");
        } finally {
          setLoadingClient(false);
        }
      })();
    }

    (async () => {
      setLoadingAccountants(true);
      try {
        const res = await fetch(`${backendUrl}user/getUsers?role=2`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        setAccountants(data.users || []);
      } catch (err) {
        console.error(err);
        setAccountants([]);
      } finally {
        setLoadingAccountants(false);
      }
    })();

    if (!assignmentId && encodedAssignmentId) {
      setAssignmentIdError("Invalid assignment ID.");
      setPrefilling(false);
      setPrefilledServices([]);
    } else if (assignmentId) {
      setAssignmentIdError(null);
      (async () => {
        setPrefilling(true);
        try {
          const res = await fetch(`${backendUrl}accountant-assignment?assignmentId=${assignmentId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          if (!res.ok) throw new Error("Failed to fetch assignment details.");
          const data = await res.json();
          if (!data || !data.accountantId) throw new Error("Invalid assignment data.");

          setSelectedAccountant(data.accountantId);

          const servicesList =
            typeof data.services === "string"
              ? data.services.split(",").map((s: string) => s.trim())
              : data.services || [];

          setPrefilledServices(servicesList);
        } catch (err) {
          console.error(err);
          setAssignmentIdError("Failed to load assignment details.");
        } finally {
          setPrefilling(false);
        }
      })();
    } else {
      setPrefilledServices([]);
    }
  }, [backendUrl, clientId, assignmentId, encodedClientId, encodedAssignmentId]);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";

    if (!selectedAccountant) {
      setAvailableServices([]);
      setSelectedServices([]);
      return;
    }

    setLoadingServices(true);
    setServicesError("");

    (async () => {
      try {
        const res = await fetch(`${backendUrl}services?userId=${selectedAccountant}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch services for accountant.");
        const data = await res.json();
        setAvailableServices(data || []);

        if (isEditing && prefilledServices.length > 0) {
          setSelectedServices(prefilledServices);
        } else {
          setSelectedServices([]);
        }
      } catch (err) {
        console.error(err);
        setAvailableServices([]);
        setSelectedServices([]);
        setServicesError("Failed to load services for the selected accountant.");
      } finally {
        setLoadingServices(false);
      }
    })();
  }, [selectedAccountant, backendUrl, isEditing, prefilledServices]);

  return (
    <>
      {clientIdError || assignmentIdError ? (
        <p className="text-red-600 font-semibold mt-4">
          Cannot proceed due to invalid or missing ID(s).
        </p>
      ) : (
        <>
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-1">Client</div>
            <div className="text-lg font-medium text-gray-800">
              {loadingClient ? (
                <Skeleton className="w-48 h-6" />
              ) : client ? (
                `${client.username} (${client.email})`
              ) : (
                "No client found"
              )}
            </div>
          </div>

          <form
            className="space-y-6"
            onSubmit={async (e) => {
              e.preventDefault();
              let valid = true;

              if (!selectedAccountant) {
                setAccountantError("Please select an accountant.");
                valid = false;
              } else {
                setAccountantError("");
              }

              if (selectedServices.length === 0) {
                setServicesError("Please select at least one service.");
                valid = false;
              } else {
                setServicesError("");
              }

              if (!valid) return;

              try {
                setSubmitting(true);
                const token = localStorage.getItem("token") || "";
                const body: any = {
                  accountantId: selectedAccountant,
                  clientId: clientId,
                  services: selectedServices,
                };
                if (assignmentId) body.assignmentId = assignmentId;

                const res = await fetch(`${backendUrl}accountant-assignment/assign`, {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(body),
                });

                if (!res.ok) {
                  const errorData = await res.json();
                  throw new Error(errorData.message || "Failed to assign accountant");
                }

                onAssigned();

                if (assignmentId) {
                  router.push(`/dashboard/clients/assign-accountants?id=${encodedClientId || ""}`);
                }

                setAlert({ message: "Accountant assigned successfully!", variant: "success" });

                setSelectedAccountant("");
                setSelectedServices([]);
                setPrefilledServices([]);
              } catch (error: any) {
                setAlert({ message: error.message || "Something went wrong", variant: "danger" });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {/* Select Accountant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Accountant <span className="text-red-500">*</span>
              </label>
              {loadingAccountants ? (
                <Skeleton className="w-full h-10" />
              ) : (
                <>
                  <select
                    className={`w-full border rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${accountantError ? "border-red-500" : "border-gray-300"
                      } ${submitting || prefilling || isEditing ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                    value={selectedAccountant}
                    onChange={(e) => setSelectedAccountant(e.target.value)}
                    disabled={submitting || prefilling || isEditing}
                  >
                    <option value="">-- Choose an accountant --</option>
                    {accountants.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.username} ({acc.email})
                      </option>
                    ))}
                  </select>
                  {accountantError && (
                    <p className="mt-1 text-sm text-red-600">{accountantError}</p>
                  )}
                </>
              )}
            </div>

            {/* Assign Services */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign Services <span className="text-red-500">*</span>
              </label>
              {loadingServices ? (
                <Skeleton className="w-full h-40" />
              ) : (
                <>
                  <select
                    multiple
                    className={`w-full h-40 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${servicesError ? "border-red-500" : "border-gray-300"
                      }`}
                    value={selectedServices}
                    onChange={(e) => {
                      const options = Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      );
                      setSelectedServices(options);
                    }}
                    disabled={submitting || prefilling}
                  >
                    {availableServices.map((service) => (
                      <option key={service.serviceCode} value={service.serviceCode}>
                        {service.name || service.serviceCode}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Hold Ctrl (Windows) or Cmd (Mac) to select multiple.
                  </p>
                  {servicesError && (
                    <p className="mt-1 text-sm text-red-600">{servicesError}</p>
                  )}
                </>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className={`bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-lg transition ${submitting || prefilling ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                disabled={submitting || prefilling}
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </>
      )}
    </>
  );
}
