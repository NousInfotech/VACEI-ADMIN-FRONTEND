export default function ClientManagement() {
    const clients = [
        {
            id: "C001",
            company: "Acme Corp",
            vat: "VAT123456",
            accountant: "John Doe",
            status: "Active",
        },
        {
            id: "C002",
            company: "Globex Ltd",
            vat: "VAT654321",
            accountant: "Jane Smith",
            status: "Inactive",
        },
        // Add more clients as needed
    ]

    return (
        <section className="mx-auto lg:max-w-[1400px] max-w-lvw px-[15px] w-full pt-8">
            <h1 className="text-xl font-semibold mb-0">Client Management</h1>
            <div className="bg-white shadow p-6 mt-5">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-gray-300 bg-gray-50">
                        <tr>
                            <th className="p-2.5 border-r border-gray-200 font-medium text-start px-8">Client ID</th>
                            <th className="p-2.5 border-r border-gray-200 font-medium text-start px-8">Company Name</th>
                            <th className="p-2.5 border-r border-gray-200 font-medium text-start px-8">VAT Number</th>
                            <th className="p-2.5 border-r border-gray-200 font-medium text-start px-8">Assigned Accountant</th>
                            <th className="p-2.5 border-r border-gray-200 font-medium text-start px-8">Status</th>
                            <th className="p-2.5 border-r border-gray-200 font-medium text-start px-8">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {clients.map((client) => (
                            <tr key={client.id} className="border-b border-gray-300">
                                <td className="p-3 text-gray-700">{client.id}</td>
                                <td className="p-3 text-gray-700">{client.company}</td>
                                <td className="p-3 text-gray-700">{client.vat}</td>
                                <td className="p-3 text-gray-700">{client.accountant}</td>
                                <td className="p-3 text-gray-700">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      client.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                  }`}>
                    {client.status}
                  </span>
                                </td>
                                <td className="p-3 space-x-3">
                                    <button
                                        className="inline-flex items-center gap-1 text-xs text-gray-800 font-medium">
                                        <i className="fi fi-rr-pencil leading-0"/> Edit
                                    </button>

                                    <button
                                        className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                                        <i className="fi fi-rr-user-add leading-0"/> Assign
                                    </button>

                                    <button
                                        className="inline-flex items-center gap-1 text-xs text-red-800 font-medium">
                                        <i className="fi fi-rr-cross-circle leading-0"/> Deactivate
                                    </button>
                                </td>

                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    )
}
