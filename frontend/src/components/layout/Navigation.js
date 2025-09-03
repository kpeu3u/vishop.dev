import React from 'react';
import { Navbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {observer} from "mobx-react-lite";

const Navigation = observer(() => {
    const authStore = useAuth();
    const { user, isAuthenticated } = authStore;
    const navigate = useNavigate();

    const handleLogout = async () => {
        await authStore.logout();
        navigate('/');
    };

    const handleProfileClick = () => {
        navigate('/profile');
    };

    return (
        <Navbar bg="primary" variant="dark" expand="lg" sticky="top">
            <Container>
                <Navbar.Brand>
                    <Link to="/" className="navbar-brand text-decoration-none text-white">
                        VShop
                    </Link>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <NavLink 
                            to="/" 
                            className={({ isActive }) => 
                                `nav-link ${isActive ? 'active' : ''}`
                            }
                        >
                            Home
                        </NavLink>
                        
                        {isAuthenticated && (
                            <>
                                <NavLink 
                                    to="/dashboard" 
                                    className={({ isActive }) => 
                                        `nav-link ${isActive ? 'active' : ''}`
                                    }
                                >
                                    Dashboard
                                </NavLink>
                                
                                {user?.roles?.includes('ROLE_MERCHANT') && (
                                    <NavLink 
                                        to="/add-vehicle" 
                                        className={({ isActive }) => 
                                            `nav-link ${isActive ? 'active' : ''}`
                                        }
                                    >
                                        Add Vehicle
                                    </NavLink>
                                )}
                                
                                {user?.roles?.includes('ROLE_BUYER') && (
                                    <NavLink 
                                        to="/favorites" 
                                        className={({ isActive }) => 
                                            `nav-link ${isActive ? 'active' : ''}`
                                        }
                                    >
                                        Favorites
                                    </NavLink>
                                )}
                            </>
                        )}
                    </Nav>

                    <Nav>
                        {isAuthenticated ? (
                            <NavDropdown 
                                title={user?.fullName || user?.email || 'User'} 
                                id="user-dropdown"
                                align="end"
                            >
                                <NavDropdown.Item onClick={handleProfileClick}>
                                    Profile
                                </NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleLogout}>
                                    Logout
                                </NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <div className="d-flex gap-2">
                                <Link 
                                    to="/login" 
                                    className="btn btn-outline-light btn-sm text-decoration-none"
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/register" 
                                    className="btn btn-light btn-sm text-decoration-none"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
});

export default Navigation;
