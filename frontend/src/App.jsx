import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const STORAGE_KEY = 'quicktask.tasks';

/** Read saved tasks safely, returning an empty list for invalid stored data. */
function loadTasks() {
  try {
    const savedTasks = window.localStorage.getItem(STORAGE_KEY);
    if (!savedTasks) return [];

    const parsedTasks = JSON.parse(savedTasks);
    if (!Array.isArray(parsedTasks)) return [];

    return parsedTasks.filter(
      (task) =>
        task &&
        typeof task.id === 'string' &&
        typeof task.text === 'string' &&
        typeof task.completed === 'boolean',
    );
  } catch {
    return [];
  }
}

/** Render the task list and persist each task-state change in this browser. */
export default function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Keep the task workflow usable when browser storage is unavailable.
    }
  }, [tasks]);

  /** Add a trimmed task when the draft contains meaningful text. */
  function addTask(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    setTasks((currentTasks) => [
      ...currentTasks,
      { id: crypto.randomUUID(), text, completed: false },
    ]);
    setDraft('');
  }

  /** Toggle completion for the task identified by its stable id. */
  function toggleTask(taskId) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  /** Remove the task identified by its stable id. */
  function deleteTask(taskId) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
  }

  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <main className="page-shell">
      <section className="task-panel" aria-labelledby="page-title">
        <header className="panel-header">
          <p className="eyebrow">A LITTLE MORE FOCUS</p>
          <h1 id="page-title">QuickTask</h1>
          <p className="subtitle">Keep your day organized</p>
        </header>

        <form className="task-form" onSubmit={addTask}>
          <label className="visually-hidden" htmlFor="task-input">
            Enter a task
          </label>
          <input
            id="task-input"
            type="text"
            placeholder="Enter a task"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            autoComplete="off"
          />
          <button className="add-button" type="submit">
            Add Task
          </button>
        </form>

        <div className="task-summary" aria-live="polite" aria-atomic="true">
          <p>
            <span className="summary-number">{tasks.length}</span>
            <span>Total tasks</span>
          </p>
          <span className="summary-divider" aria-hidden="true" />
          <p>
            <span className="summary-number">{completedCount}</span>
            <span>Completed</span>
          </p>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state" role="status">
            <span className="empty-mark" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none">
                <rect x="9" y="8" width="30" height="34" rx="7" />
                <path d="M17 19h14M17 26h14M17 33h8" />
                <path d="m15 8 2-3h14l2 3" />
              </svg>
            </span>
            <p>No tasks yet. Add your first task!</p>
          </div>
        ) : (
          <ul className="task-list" aria-label="Tasks">
            {tasks.map((task) => (
              <li className="task-row" key={task.id}>
                <label className="task-label">
                  <input
                    className="task-checkbox"
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    aria-label={`Mark ${task.text} complete`}
                  />
                  <span className={task.completed ? 'task-text is-complete' : 'task-text'}>
                    {task.text}
                  </span>
                </label>
                <button
                  className="delete-button"
                  type="button"
                  onClick={() => deleteTask(task.id)}
                  aria-label={`Delete ${task.text}`}
                >
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M4 6h12M8 6V4h4v2m-7 0 1 10h8l1-10M8.5 9v4m3-4v4" />
                  </svg>
                  <span>Delete</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <footer className="panel-footer">
          <span className="footer-dot" aria-hidden="true" />
          <span>Your list is saved on this device</span>
        </footer>
      </section>
      <p className="page-note">Small steps make a good day.</p>
    </main>
  );
}

App.propTypes = {};
