// src/components/Dashboard.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Calendar } from 'lucide-react';
import TodoApp from '../TodoApp';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-bold">
            📝 Todo Dashboard
          </span>
          
          <div className="navbar-nav ms-auto">
            <div className="nav-item dropdown">
              <button
                className="btn btn-link nav-link dropdown-toggle text-white text-decoration-none d-flex align-items-center"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <User size={20} className="me-2" />
                {user?.name}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <span className="dropdown-item-text">
                    <small className="text-muted">Signed in as</small><br />
                    <strong>{user?.email}</strong>
                  </span>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <span className="dropdown-item-text">
                    <Calendar size={14} className="me-1" />
                    <small>Joined {formatDate(user?.createdAt || new Date())}</small>
                  </span>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} className="me-2" />
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Welcome Section */}
      <div className="container py-4">
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
              <div className="card-body p-4">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h2 className="mb-1">
                      Welcome back, <span className="text-primary">{user?.name}!</span> 👋
                    </h2>
                    <p className="text-muted mb-0">
                      Ready to tackle your tasks today? Let's get things done!
                    </p>
                  </div>
                  <div className="col-md-4 text-md-end">
                    <div className="badge bg-light text-dark fs-6 px-3 py-2">
                      {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Todo App */}
      <div className="container-fluid px-0">
        <TodoApp />
      </div>
    </div>
  );
};

export default Dashboard;