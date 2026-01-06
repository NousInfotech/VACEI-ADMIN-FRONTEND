"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAlert } from "@/app/context/AlertContext";

interface Client {
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

export default function AssignClients({ onAssigned }: { onAssigned: () => void }) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAlert } = useAlert();

  const encodedId = searchParams.get("id");
  const encodedAssignmentId = searchParams.get("aid");

  let userId: string | null = null;
  let assignmentId: string | null = null;

  try {
    userId = encodedId ? atob(encodedId) : null;
  } catch {
    userId = null;
  }

  try {
    assignmentId = encodedAssignmentId ? atob(encodedAssignmentId) : null;
  } catch {
    assignmentId = null;
  }

  const isEditing = !!assignmentId;

  const [submitting, setSubmitting] = useState(false);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [prefilledServices, setPrefilledServices] = useState<string[]>([]);
  const [accountant, setAccountant] = useState<Client | null>(null);

  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingAccountant, setLoadingAccountant] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [prefilling, setPrefilling] = useState(false);

  const [clientError, setClientError] = useState("");
  const [servicesError, setServicesError] = useState("");

  const [userIdError, setUserIdError] = useState<string | null>(null);
  const [assignmentIdError, setAssignmentIdError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";

    if (!userId) {
      setUserIdError("Invalid or missing user ID.");
      setAccountant(null);
      setAvailableServices([]);
      setLoadingAccountant(false);
      setLoadingServices(false);
    } else {
      setUserIdError(null);

      // Fetch accountant details
      (async () => {
        setLoadingAccountant(true);
        try {
          const res = await fetch(`${backendUrl}user/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          if (!res.ok) throw new Error("Accountant not found.");
          const data = await res.json();
          if (!data?.id) throw new Error("Accountant not found.");
          setAccountant(data);
        } catch (err) {
          console.error(err);
          setAccountant(null);
          setUserIdError("Accountant not found or invalid user ID.");
        } finally {
          setLoadingAccountant(false);
        }
      })();

      // Fetch services
      (async () => {
        setLoadingServices(true);
        try {
          const res = await fetch(`${backendUrl}services?userId=${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          if (!res.ok) throw new Error("Failed to fetch services.");
          const data = await res.json();
          setAvailableServices(data || []);
        } catch (err) {
          console.error(err);
          setAvailableServices([]);
          setServicesError("Failed to load services.");
        } finally {
          setLoadingServices(false);
        }
      })();
    }

    // Always fetch clients
    (async () => {
      setLoadingClients(true);
      try {
        const res = await fetch(`${backendUrl}user/getUsers?role=3`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        setClients(data.users || []);
      } catch (err) {
        console.error(err);
        setClients([]);
      } finally {
        setLoadingClients(false);
      }
    })();

    // Prefill assignment data if editing
    if (!assignmentId && encodedAssignmentId) {
      setAssignmentIdError("Invalid assignment ID.");
      setPrefilling(false);
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
          if (!data?.clientId) throw new Error("Invalid assignment data.");
          setSelectedClient(data.clientId);

          const servicesList =
            typeof data.services === "string"
              ? data.services.split(",").map((s: string) => s.trim())
              : data.services || [];

          setPrefilledServices(servicesList);
          setSelectedServices(servicesList);
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
  }, [backendUrl, userId, assignmentId, encodedId, encodedAssignmentId]);

  return (
    <>
      {userIdError || assignmentIdError ? (
        <p className="text-red-600 font-semibold mt-4">
          Cannot proceed due to invalid or missing ID(s).
        </p>
      ) : (
        <>
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-1">Accountant</div>
            <div className="text-lg font-medium text-gray-800">
              {loadingAccountant ? (
                <Skeleton className="w-48 h-6" />
              ) : accountant ? (
                `${accountant.username} (${accountant.email})`
              ) : (
                "No accountant found"
              )}
            </div>
          </div>

          <form
            className="space-y-6"
            onSubmit={async (e) => {
              e.preventDefault();
              let valid = true;

              if (!selectedClient) {
                setClientError("Please select a client.");
                valid = false;
              } else {
                setClientError("");
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
                  accountantId: userId,
                  clientId: selectedClient,
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
                  throw new Error(errorData.message || "Failed to assign clients");
                }

                onAssigned();

                if (assignmentId) {
                  router.push(`/dashboard/accountants/assign-clients?id=${encodedId || ""}`);
                }

                setAlert({ message: "Client assigned successfully!", variant: "success" });

                setSelectedClient("");
                setSelectedServices([]);
                setPrefilledServices([]);
              } catch (error: any) {
                setAlert({ message: error.message || "Something went wrong", variant: "danger" });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {/* Select Client */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Client <span className="text-red-500">*</span>
              </label>
              {loadingClients ? (
                <Skeleton className="w-full h-10" />
              ) : (
                <>
                  <select
                    className={`w-full border rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      clientError ? "border-red-500" : "border-gray-300"
                    } ${submitting || prefilling || isEditing ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    disabled={submitting || prefilling || isEditing}
                  >
                    <option value="">-- Choose a client --</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.username} ({client.email})
                      </option>
                    ))}
                  </select>
                  {clientError && (
                    <p className="mt-1 text-sm text-red-600">{clientError}</p>
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
                    className={`w-full h-40 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      servicesError ? "border-red-500" : "border-gray-300"
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

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
               className={`bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-lg transition ${
  submitting || prefilling ? "opacity-70 cursor-not-allowed" : ""
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
