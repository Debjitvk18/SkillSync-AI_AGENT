import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const CheckAuth = ({ children, protected: isProtected }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (isProtected) {
            if (!token) {
                navigate('/login')
            }
            else {
                setLoading(false)
            }
        }
        else {
            if (token) {
                navigate('/')
            }
            else {
                setLoading(false)
            }
        }

    }, [navigate, isProtected])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-purple-400"></div>
            </div>
        )
    }
    return children
}

export default CheckAuth