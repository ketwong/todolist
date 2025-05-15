import { useEffect, useState } from 'react';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [assistMsg, setAssistMsg] = useState("");
  const [assistLoading, setAssistLoading] = useState(false);
  const [assistFollowup, setAssistFollowup] = useState("");
  const [followupTask, setFollowupTask] = useState(null);

  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(setTasks);
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTask })
    });
    const task = await res.json();
    setTasks([...tasks, task]);
    setNewTask('');
  };

  const updateTask = async (id, completed, description) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(description !== undefined ? { completed, description } : { completed })
    });
    const updated = await res.json();
    setTasks(tasks.map(t => t.id === id ? updated : t));
  };

  const deleteTask = async (id) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    setTasks(tasks.filter(t => t.id !== id));
  };

  const assistTask = async (task) => {
    setAssistLoading(true);
    setAssistMsg("");
    setAssistFollowup("");
    setFollowupTask(task);
    const res = await fetch('/api/assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: task.title, description: task.description || '' })
    });
    const data = await res.json();
    setAssistMsg(data.message);
    setAssistLoading(false);
  };

  const sendFollowup = async (e) => {
    e.preventDefault();
    if (!assistFollowup.trim() || !followupTask) return;
    setAssistLoading(true);
    setAssistMsg("");
    // Update the task with the new description/context
    await updateTask(followupTask.id, followupTask.completed, assistFollowup);
    // Call assist again with updated context
    const res = await fetch('/api/assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: followupTask.title, description: assistFollowup })
    });
    const data = await res.json();
    setAssistMsg(data.message);
    setAssistLoading(false);
    setAssistFollowup("");
    setFollowupTask(null);
  };

  return (
    <div className="app">
      <h1>To-Do List</h1>
      <form onSubmit={addTask}>
        <input
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          placeholder="Add a new task"
        />
        <button type="submit">Add</button>
      </form>
      {assistMsg && (
        <div className="assist-msg">
          {assistMsg}
          {assistMsg.includes('provide more details') && (
            <form onSubmit={sendFollowup} style={{marginTop:'1rem'}}>
              <input
                type="text"
                value={assistFollowup}
                onChange={e => setAssistFollowup(e.target.value)}
                placeholder="Add more details or context"
                style={{width:'80%'}}
              />
              <button type="submit" disabled={assistLoading} style={{background:'#007bff',marginLeft:'0.5rem'}}>
                {assistLoading ? 'Sending...' : 'Send'}
              </button>
            </form>
          )}
        </div>
      )}
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={e => updateTask(task.id, e.target.checked)}
            />
            <span style={{ textDecoration: task.completed ? 'line-through' : '' }}>
              {task.title}
            </span>
            <button onClick={() => deleteTask(task.id)}>Delete</button>
            <button onClick={() => assistTask(task)} disabled={assistLoading} style={{background:'#28a745'}}>
              {assistLoading ? 'Thinking...' : 'Assist'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
