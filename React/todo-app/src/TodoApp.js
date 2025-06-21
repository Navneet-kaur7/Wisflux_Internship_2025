import React, { useState, useEffect } from 'react';
import { Plus, X, Check } from 'lucide-react';

export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');

  // Load tasks from database
  useEffect(() => {
    fetch('http://localhost:3000/api/tasks')
      .then(res => res.json())
      .then(data => setTasks(data));
  }, []);

  const addTask = async () => {
    if (newTask.trim()) {
      const response = await fetch('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newTask.trim() })
      });
      const task = await response.json();
      setTasks([...tasks, task]);
      setNewTask('');
    }
  };

  const deleteTask = async (id) => {
    await fetch(`http://localhost:3000/api/tasks/${id}`, {
      method: 'DELETE'
    });
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    const response = await fetch(`http://localhost:3000/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed })
    });
    const updatedTask = await response.json();
    setTasks(tasks.map(t => t.id === id ? updatedTask : t));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const completedCount = tasks.filter(task => task.completed).length;
  const activeCount = tasks.length - completedCount;

  return (
    <div className="min-vh-100 py-4 px-3" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)' }}>
      <div className="container" style={{ maxWidth: '500px' }}>
        <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
          <div className="card-body p-4">
            <h1 className="text-center fw-bold text-dark mb-4">
              To-Do App
            </h1>
            
            {/* Add Task Input */}
            <div className="d-flex gap-2 mb-4">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                placeholder="Add a new task..."
                className="form-control form-control-lg border-1"
                style={{ borderRadius: '10px' }}
              />
              <button
                onClick={addTask}
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
                </button>
              ))}
            </div>

            {/* Task List */}
            <div className="mb-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <em>{filter === 'all' ? 'No tasks yet!' : `No ${filter} tasks`}</em>
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
                    style={{ transition: 'all 0.2s ease' }}
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
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
                      {task.completed && <Check size={14} />}
                    </button>
                    
                    <span
                      className={`flex-grow-1 ${
                        task.completed
                          ? 'text-muted text-decoration-line-through'
                          : 'text-dark'
                      }`}
                    >
                      {task.text}
                    </span>
                    
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="btn btn-link text-muted p-1"
                      style={{ textDecoration: 'none' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Stats */}
            {tasks.length > 0 && (
              <div className="text-center small text-muted bg-light rounded-3 py-3">
                <strong>{activeCount}</strong> active, <strong>{completedCount}</strong> completed
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}