import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Navbar = () => {
    const { user, logout } = useAuth()

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className='container'>
                <Link className="navbar-brand" to="/">Prophecy</Link>
                <button className='navbar-toggler' type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className='navbar-toggler-icon'></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        {user && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/">Dashboard</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/goals">Goals</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/expenses">Expenses</Link>
                                </li>
                            </>
                        )}
                    </ul>
                    <ul className='navbar-nav'>
                        {user ? (
                            <li className='nav-item'>
                                <button className="nav-link btn btn-link" onClick={logout}>Logout</button>
                            </li>
                        ) : (
                            <>
                                <li className='nav-item'>
                                    <Link className='nav-link' to="/login">Login</Link>
                                </li>
                                <li className='nav-item'>
                                    <Link className='nav-link' to="/register">Register</Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Navbar