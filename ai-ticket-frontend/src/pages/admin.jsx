import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import Layout from "../components/layout"

const Admin = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("tickets"); // "tickets" or "users"
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ email: "", role: "", skills: [] });
    const [skillInput, setSkillInput] = useState("");

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user.role !== "admin") {
            alert("Access denied. Admin only.");
            navigate("/");
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");

            // Fetch tickets
            const ticketsRes = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const ticketsData = await ticketsRes.json();
            if (ticketsRes.ok) {
                setTickets(ticketsData.tickets || []);
            }

            // Fetch users
            const usersRes = await fetch(`${import.meta.env.VITE_SERVER_URL}/users/users`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const usersData = await usersRes.json();
            if (usersRes.ok) {
                setUsers(Array.isArray(usersData) ? usersData : []);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = (user) => {
        setEditingUser(user._id);
        setEditForm({
            email: user.email,
            role: user.role,
            skills: user.skills || []
        });
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/users/update-user`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(editForm)
            });
            const data = await res.json();
            if (res.ok) {
                alert("User updated successfully!");
                setEditingUser(null);
                fetchData();
            } else {
                alert(data.message || "Update failed");
            }
        } catch (error) {
            alert("An error occurred");
        }
    };

    const handleAddSkill = () => {
        if (skillInput.trim() && !editForm.skills.includes(skillInput.trim())) {
            setEditForm({
                ...editForm,
                skills: [...editForm.skills, skillInput.trim()]
            });
            setSkillInput("");
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setEditForm({
            ...editForm,
            skills: editForm.skills.filter(skill => skill !== skillToRemove)
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "TODO": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
            case "IN_PROGRESS": return "bg-blue-500/20 text-blue-300 border-blue-500/50";
            case "DONE": return "bg-green-500/20 text-green-300 border-green-500/50";
            default: return "bg-gray-500/20 text-gray-300 border-gray-500/50";
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case "admin": return "bg-red-500/20 text-red-300 border-red-500/50";
            case "moderator": return "bg-purple-500/20 text-purple-300 border-purple-500/50";
            case "user": return "bg-blue-500/20 text-blue-300 border-blue-500/50";
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
                    <p className="text-purple-200">Manage users, roles, and view all tickets</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab("tickets")}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "tickets"
                                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                                : "bg-white/10 text-purple-200 border border-white/20 hover:bg-white/20"
                            }`}
                    >
                        All Tickets ({tickets.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("users")}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "users"
                                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                                : "bg-white/10 text-purple-200 border border-white/20 hover:bg-white/20"
                            }`}
                    >
                        Manage Users ({users.length})
                    </button>
                </div>

                {/* Tickets Tab */}
                {activeTab === "tickets" && (
                    <div className="space-y-4">
                        {tickets.length === 0 ? (
                            <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-12 text-center">
                                <p className="text-purple-200">No tickets found</p>
                            </div>
                        ) : (
                            tickets.map((ticket) => (
                                <Link
                                    key={ticket._id}
                                    to={`/tickets/${ticket._id}`}
                                    className="block backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6 hover:bg-white/20 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-xl font-bold text-white">{ticket.title}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(ticket.status)}`}>
                                            {ticket.status.replace("_", " ")}
                                        </span>
                                    </div>
                                    <p className="text-purple-200 text-sm mb-3 line-clamp-2">{ticket.description}</p>
                                    <div className="flex items-center gap-6 text-sm">
                                        <div className="flex items-center gap-2 text-purple-300">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </div>
                                        {ticket.assignedTo && (
                                            <div className="flex items-center gap-2 text-purple-300">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                {ticket.assignedTo.email}
                                            </div>
                                        )}
                                        {ticket.priority && (
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${ticket.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                                                        ticket.priority === 'medium' ? 'bg-orange-500/20 text-orange-300' :
                                                            'bg-green-500/20 text-green-300'
                                                    }`}>
                                                    {ticket.priority.toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === "users" && (
                    <div className="space-y-4">
                        {users.length === 0 ? (
                            <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-12 text-center">
                                <p className="text-purple-200">No users found</p>
                            </div>
                        ) : (
                            users.map((user) => (
                                <div
                                    key={user._id}
                                    className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6"
                                >
                                    {editingUser === user._id ? (
                                        // Edit Form
                                        <form onSubmit={handleUpdateUser} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-purple-200 block mb-2">Email</label>
                                                    <input
                                                        type="email"
                                                        value={editForm.email}
                                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-purple-200 block mb-2">Role</label>
                                                    <select
                                                        value={editForm.role}
                                                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="moderator">Moderator</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-purple-200 block mb-2">Skills</label>
                                                <div className="flex gap-2 mb-2">
                                                    <input
                                                        type="text"
                                                        value={skillInput}
                                                        onChange={(e) => setSkillInput(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                                        className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                                                        placeholder="Add skill"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleAddSkill}
                                                        className="px-4 py-2 bg-purple-500/50 rounded-xl text-white hover:bg-purple-500/70 transition-all"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                                {editForm.skills.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {editForm.skills.map((skill, index) => (
                                                            <span
                                                                key={index}
                                                                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/30 border border-purple-400/50 rounded-full text-sm text-purple-100"
                                                            >
                                                                {skill}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveSkill(skill)}
                                                                    className="hover:text-red-300"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingUser(null)}
                                                    className="flex-1 px-4 py-2 bg-white/5 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all"
                                                >
                                                    Save Changes
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        // View Mode
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-white mb-2">{user.email}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
                                                        {user.role.toUpperCase()}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="px-4 py-2 bg-purple-500/30 border border-purple-400/50 text-white rounded-xl hover:bg-purple-500/50 transition-all"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                            {user.skills && user.skills.length > 0 && (
                                                <div>
                                                    <p className="text-sm text-purple-300 mb-2">Skills:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {user.skills.map((skill, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-sm text-purple-100"
                                                            >
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default Admin