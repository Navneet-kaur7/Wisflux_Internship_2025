import React, { useState, useEffect } from 'react';
import { Plus, X, Check, Loader2, Trash2 } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskLoading, setTaskLoading] = useState({}); // Track loading state for individual tasks

  // Get auth token from localStorage - FIXED: using consistent key
  const getAuthToken = () => {
    return localStorage.getItem('todoapp_token'); // Changed from 'token' to 'todoapp_token'
  };

  // Create headers with auth token
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  };

  // Fetch tasks from the backend
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching tasks with token:', token ? 'Token present' : 'No token'); // Debug log

      const response = await fetch(`${API_BASE_URL}/tasks`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched tasks:', data); // Debug log
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.message || 'Failed to load tasks. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Load tasks when component mounts
  useEffect(() => {
    fetchTasks();
  }, []);

  // Add a new task
  const addTask = async () => {
    if (!newTask.trim()) return;

    try {
      setError(null);
      console.log('Adding task:', newTask.trim()); // Debug log
      
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ text: newTask.trim() }),
      });

      console.log('Add task response status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Add task error response:', errorData); // Debug log
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const newTaskData = await response.json();
      console.log('New task created:', newTaskData); // Debug log
      setTasks([newTaskData, ...tasks]); // Add new task to the beginning
      setNewTask('');
    } catch (err) {
      console.error('Error adding task:', err);
      setError(err.message || 'Failed to add task. Please try again.');
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    try {
      setTaskLoading(prev => ({ ...prev, [id]: true }));
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err.message || 'Failed to delete task. Please try again.');
    } finally {
      setTaskLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Toggle task completion
  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
      setTaskLoading(prev => ({ ...prev, [id]: true }));
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(t => t.id === id ? updatedTask : t));
    } catch (err) {
      console.error('Error toggling task:', err);
      setError(err.message || 'Failed to update task. Please try again.');
    } finally {
      setTaskLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Clear all completed tasks
  const clearCompleted = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/tasks/completed`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setTasks(tasks.filter(task => !task.completed));
    } catch (err) {
      console.error('Error clearing completed tasks:', err);
      setError(err.message || 'Failed to clear completed tasks. Please try again.');
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const completedCount = tasks.filter(task => task.completed).length;
  const activeCount = tasks.length - completedCount;

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 py-4 px-3 d-flex align-items-center justify-content-center" 
           style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)' }}>
        <div className="text-center">
          <Loader2 className="mb-3" size={48} style={{ animation: 'spin 1s linear infinite' }} />
          <h4 className="text-muted">Loading tasks...</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 py-4 px-3" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)' }}>
      <div className="container" style={{ maxWidth: '500px' }}>
        <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
          <div className="card-body p-4">
            <h1 className="text-center fw-bold text-dark mb-4">
              To-Do App
              <small className="d-block text-muted fs-6 mt-1">
                Connected to PostgreSQL
              </small>
            </h1>
            
            {/* Debug Info */}
            <div className="alert alert-info small mb-3">
              Token: {getAuthToken() ? '✓ Present' : '✗ Missing'} | 
              Tasks: {tasks.length} | 
              API: {API_BASE_URL}
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                {error}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setError(null)}
                  aria-label="Close"
                ></button>
              </div>
            )}
            
            {/* Add Task Input */}
            <div className="d-flex gap-2 mb-4">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a new task..."
                className="form-control form-control-lg border-1"
                style={{ borderRadius: '10px' }}
                disabled={loading}
              />
              <button
                onClick={addTask}
                disabled={!newTask.trim() || loading}
                className="btn btn-primary btn-lg px-3"
                style={{ borderRadius: '10px' }}
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Filter Buttons */}
            <div className="btn-group w-100 mb-4" role="group">
              {['all', 'active', 'completed'].map((filterType) => (
                <button
                  key={filterType}
                  type="button"
                  onClick={() => setFilter(filterType)}
                  className={`btn ${
                    filter === filterType
                      ? 'btn-primary'
                      : 'btn-outline-secondary'
                  } text-capitalize`}
                >
                  {filterType}
                  {filterType === 'active' && activeCount > 0 && (
                    <span className="badge bg-light text-dark ms-1">{activeCount}</span>
                  )}
                  {filterType === 'completed' && completedCount > 0 && (
                    <span className="badge bg-light text-dark ms-1">{completedCount}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Clear Completed Button */}
            {completedCount > 0 && (
              <div className="text-center mb-3">
                <button
                  onClick={clearCompleted}
                  className="btn btn-outline-danger btn-sm"
                >
                  <Trash2 size={14} className="me-1" />
                  Clear {completedCount} completed task{completedCount > 1 ? 's' : ''}
                </button>
              </div>
            )}

            {/* Task List */}
            <div className="mb-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <em>
                    {filter === 'all' && tasks.length === 0 
                      ? 'No tasks yet! Add one above.' 
                      : `No ${filter} tasks`}
                  </em>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`d-flex align-items-center gap-3 p-3 mb-2 border rounded-3 ${
                      task.completed
                        ? 'bg-light border-secondary'
                        : 'bg-white border-light'
                    }`}
                    style={{ 
                      transition: 'all 0.2s ease',
                      opacity: taskLoading[task.id] ? 0.6 : 1
                    }}
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      disabled={taskLoading[task.id]}
                      className={`btn p-0 rounded-circle d-flex align-items-center justify-content-center ${
                        task.completed
                          ? 'btn-success'
                          : 'btn-outline-secondary'
                      }`}
                      style={{ 
                        width: '30px', 
                        height: '30px',
                        border: task.completed ? '2px solid #198754' : '2px solid #6c757d'
                      }}
                    >
                      {taskLoading[task.id] ? (
                        <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                      ) : (
                        task.completed && <Check size={14} />
                      )}
                    </button>
                    
                    <span
                      className={`flex-grow-1 ${
                        task.completed
                          ? 'text-muted text-decoration-line-through'
                          : 'text-dark'
                      }`}
                      style={{ transition: 'all 0.2s ease' }}
                    >
                      {task.text}
                    </span>
                    
                    <button
                      onClick={() => deleteTask(task.id)}
                      disabled={taskLoading[task.id]}
                      className="btn btn-link text-muted p-1"
                      style={{ 
                        transition: 'color 0.2s ease',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => e.target.style.color = '#dc3545'}
                      onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                    >
                      {taskLoading[task.id] ? (
                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <X size={16} />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Stats */}
            {tasks.length > 0 && (
              <div className="text-center small text-muted bg-light rounded-3 py-3">
                <strong>{activeCount}</strong> active, <strong>{completedCount}</strong> completed
                <div className="text-xs mt-1">
                  Total: <strong>{tasks.length}</strong> tasks
                </div>
              </div>
            )}

            {/* Refresh Button */}
            <div className="text-center mt-3">
              <button
                onClick={fetchTasks}
                disabled={loading}
                className="btn btn-outline-primary btn-sm"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="me-1" style={{ animation: 'spin 1s linear infinite' }} />
                    Refreshing...
                  </>
                ) : (
                  'Refresh Tasks'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}