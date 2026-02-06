import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"

export default function Navbar() {
    const [user, setUser] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const userData = localStorage.getItem("user")
        if (userData) {
            setUser(JSON.parse(userData))
        }
    }, [])

    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/login")
    }

    const token = localStorage.getItem("token")

    return (
        <header className="backdrop-blur-xl bg-white/10 border-b border-white/20 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">AI Ticket System</h1>
                            {user && <p className="text-xs text-purple-200">{user.email}</p>}
                        </div>
                    </Link>

                    <div className="flex items-center gap-3">
                        {!token ? (
                            <>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-white hover:text-purple-200 transition-colors font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Sign Up
                                </Link>
                            </>
                        ) : (
                            <>
                                {user?.role === 'admin' && (
                                    <Link
                                        to="/admin"
                                        className="px-4 py-2 bg-purple-500/30 border border-purple-400/50 text-white rounded-xl hover:bg-purple-500/50 transition-all font-medium"
                                    >
                                        <span className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Admin
                                        </span>
                                    </Link>
                                )}
                                <button
                                    onClick={logout}
                                    className="px-4 py-2 bg-red-500/30 border border-red-400/50 text-white rounded-xl hover:bg-red-500/50 transition-all font-medium"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}