import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { JSX } from 'react'

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const { user, loading } = useAuth()

    if (loading) {
        return <div className="d-flex justify-content-center mt-5">
            <div className='spinner-border' role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    }

    return user ? children : <Navigate to="/login" />
}

export default PrivateRoute
