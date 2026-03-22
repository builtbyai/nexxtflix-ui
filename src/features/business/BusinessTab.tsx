import React, { useState } from 'react';
import './BusinessTab.css';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

interface Props {
  onOpenAI: () => void;
}

export default function BusinessTab({ onOpenAI }: Props) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Design new dashboard',
      description: 'Create mockups for the new UI',
      status: 'in-progress',
      priority: 'high',
      dueDate: '2024-12-20'
    },
    {
      id: '2',
      title: 'Review Q4 budget',
      description: 'Financial planning',
      status: 'todo',
      priority: 'high',
      dueDate: '2024-12-25'
    },
    {
      id: '3',
      title: 'Client meeting prep',
      description: 'Prepare presentation',
      status: 'done',
      priority: 'medium',
      dueDate: '2024-12-15'
    }
  ]);

  const [filter, setFilter] = useState<Task['status'] | 'all'>('all');

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'todo':
        return 'Todo';
      case 'in-progress':
        return 'In Progress';
      case 'done':
        return 'Done';
      default:
        return status;
    }
  };

  return (
    <div className="business-tab">
      <div className="business-header">
        <h2 className="business-title">Tasks</h2>
        <button className="business-ai-btn" onClick={onOpenAI} title="AI Assistant">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
          </svg>
        </button>
      </div>

      <div className="business-filters">
        {(['all', 'todo', 'in-progress', 'done'] as const).map(status => (
          <button
            key={status}
            className={`business-filter-btn ${filter === status ? 'business-filter-btn--active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? 'All' : status === 'in-progress' ? 'In Progress' : status === 'todo' ? 'To Do' : 'Done'}
          </button>
        ))}
      </div>

      <div className="business-tasks">
        {filteredTasks.length === 0 ? (
          <div className="business-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p>No tasks yet</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className="business-task-card">
              <div className="business-task-header">
                <h3 className="business-task-title">{task.title}</h3>
                <span className={`business-priority-badge ${getPriorityColor(task.priority)}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              </div>
              <p className="business-task-description">{task.description}</p>
              <div className="business-task-footer">
                <span className="business-task-date">{new Date(task.dueDate).toLocaleDateString()}</span>
                <span className="business-task-status">{getStatusBadge(task.status)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
