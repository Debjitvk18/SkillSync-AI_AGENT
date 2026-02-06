import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Layout from "../components/layout"

const Tickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({
        title: "",
        description: ""
    });
    const [createLoading, setCreateLoading] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                setTickets(data.tickets || []);
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(createForm)
            });
            const data = await res.json();
            if (res.ok) {
                setShowCreateModal(false);
                setCreateForm({ title: "", description: "" });
                fetchTickets();
                alert("Ticket created successfully! AI is analyzing it now.");
            } else {
                alert(data.message || "Failed to create ticket");
            }
        } catch (error) {
            alert("An error occurred");
        } finally {
            setCreateLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "TODO": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
            case "IN_PROGRESS": return "bg-blue-500/20 text-blue-300 border-blue-500/50";
            case "DONE": return "bg-green-500/20 text-green-300 border-green-500/50";
            default: return "bg-gray-500/20 text-gray-300 border-gray-500/50";
        }
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Actions Bar */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">My Tickets</h2>
                        <p className="text-purple-200">Manage and track your support tickets</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Ticket
                    </button>
                </div>

                {/* Tickets Grid */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-400"></div>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-12 text-center">
                        <svg className="w-24 h-24 text-purple-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-2xl font-bold text-white mb-2">No tickets yet</h3>
                        <p className="text-purple-200 mb-6">Create your first ticket to get started</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                            Create Your First Ticket
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tickets.map((ticket) => (
                            <Link
                                key={ticket._id}
                                to={`/tickets/${ticket._id}`}
                                className="group backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6 hover:bg-white/20 hover:scale-[1.02] transition-all cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors line-clamp-2">
                                        {ticket.title}
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(ticket.status)}`}>
                                        {ticket.status.replace("_", " ")}
                                    </span>
                                </div>
                                <p className="text-purple-200 text-sm mb-4 line-clamp-3">
                                    {ticket.description}
                                </p>
                                <div className="flex items-center text-sm text-purple-300">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Create Ticket Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8 max-w-2xl w-full">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-3xl font-bold text-white mb-2">Create New Ticket</h3>
                                    <p className="text-purple-200">Our AI will analyze and assign your ticket</p>
                                </div>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-purple-200 hover:text-white transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <form onSubmit={handleCreateTicket} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-purple-200 block mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={createForm.title}
                                        onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                                        placeholder="Brief description of the issue"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-purple-200 block mb-2">Description</label>
                                    <textarea
                                        value={createForm.description}
                                        onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all resize-none"
                                        placeholder="Provide detailed information about your issue..."
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-6 py-3 bg-white/5 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createLoading}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                                    >
                                        {createLoading ? "Creating..." : "Create Ticket"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default Tickets