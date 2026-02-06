import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import Layout from "../components/layout"

const TicketDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
        fetchTicket();
    }, [id]);

    const fetchTicket = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets/${id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                setTicket(data.ticket);
            } else {
                alert(data.message || "Failed to fetch ticket");
                navigate("/");
            }
        } catch (error) {
            console.error("Error fetching ticket:", error);
        } finally {
            setLoading(false);
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

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case "high": return "bg-red-500/20 text-red-300 border-red-500/50";
            case "medium": return "bg-orange-500/20 text-orange-300 border-orange-500/50";
            case "low": return "bg-green-500/20 text-green-300 border-green-500/50";
            default: return "bg-gray-500/20 text-gray-300 border-gray-500/50";
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-400"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Link */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-purple-200 hover:text-white transition-colors mb-6"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Tickets
                </Link>

                <div className="space-y-6">
                    {/* Ticket Header Card */}
                    <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex-1">
                                <h1 className="text-4xl font-bold text-white mb-3">{ticket?.title}</h1>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(ticket?.status)}`}>
                                        {ticket?.status?.replace("_", " ")}
                                    </span>
                                    {ticket?.priority && (
                                        <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getPriorityColor(ticket?.priority)}`}>
                                            {ticket?.priority?.toUpperCase()} PRIORITY
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center gap-3 text-purple-200">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <div>
                                    <p className="text-xs text-purple-300">Created</p>
                                    <p className="text-white font-medium">{new Date(ticket?.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                            {ticket?.assignedTo && (
                                <div className="flex items-center gap-3 text-purple-200">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <div>
                                        <p className="text-xs text-purple-300">Assigned To</p>
                                        <p className="text-white font-medium">{ticket?.assignedTo?.email || "Unassigned"}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                            <p className="text-purple-200 leading-relaxed whitespace-pre-wrap">{ticket?.description}</p>
                        </div>
                    </div>

                    {/* AI Analysis Card (only for admin/moderator) */}
                    {(user?.role === 'admin' || user?.role === 'moderator') && (
                        <>
                            {ticket?.helpfullNotes && (
                                <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl border border-purple-400/50 p-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">AI Analysis</h3>
                                            <p className="text-purple-200">Automated insights and recommendations</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                                        <p className="text-purple-100 leading-relaxed whitespace-pre-wrap">{ticket?.helpfullNotes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Related Skills */}
                            {ticket?.relatedSkill && ticket.relatedSkill.length > 0 && (
                                <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8">
                                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                        Required Skills
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {ticket.relatedSkill.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-4 py-2 bg-gradient-to-r from-purple-500/30 to-blue-500/30 border border-purple-400/50 rounded-xl text-purple-100 font-medium"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* User View - Simple Info */}
                    {user?.role === 'user' && (
                        <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8 text-center">
                            <svg className="w-16 h-16 text-purple-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-xl font-bold text-white mb-2">Ticket Submitted</h3>
                            <p className="text-purple-200">
                                Your ticket has been received and our AI is analyzing it.
                                {ticket?.status === 'TODO' && " A moderator will be assigned shortly."}
                                {ticket?.status === 'IN_PROGRESS' && " A moderator is working on your ticket."}
                                {ticket?.status === 'DONE' && " Your ticket has been resolved!"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}

export default TicketDetailsPage