import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App.jsx';

describe('QuickTask workflow', () => {
  it('shows the empty state and rejects empty or whitespace-only submissions', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent('No tasks yet. Add your first task!');
    const input = screen.getByRole('textbox', { name: 'Enter a task' });
    await user.click(screen.getByRole('button', { name: 'Add Task' }));
    expect(screen.queryByRole('list')).not.toBeInTheDocument();

    await user.type(input, '   ');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(window.localStorage.getItem('quicktask.tasks')).toBe('[]');
  });

  it('adds trimmed tasks by button and Enter in insertion order and clears the input', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole('textbox', { name: 'Enter a task' });

    await user.type(input, '  First task  ');
    await user.click(screen.getByRole('button', { name: 'Add Task' }));
    expect(input).toHaveValue('');
    await user.type(input, 'Second task{Enter}');

    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('First task');
    expect(rows[1]).toHaveTextContent('Second task');
    expect(screen.getByText('2', { selector: '.summary-number' })).toBeInTheDocument();
  });

  it('toggles completion both ways and updates the completed count', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole('textbox', { name: 'Enter a task' });
    await user.type(input, 'Read a chapter{Enter}');

    const checkbox = screen.getByRole('checkbox', { name: 'Mark Read a chapter complete' });
    const taskText = screen.getByText('Read a chapter');
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(taskText).toHaveClass('is-complete');
    expect(screen.getByText('1', { selector: '.task-summary p:last-child .summary-number' })).toBeInTheDocument();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(taskText).not.toHaveClass('is-complete');
    expect(screen.getByText('0', { selector: '.task-summary p:last-child .summary-number' })).toBeInTheDocument();
  });

  it('deletes a task and updates total and completed counts', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole('textbox', { name: 'Enter a task' });
    await user.type(input, 'Remove me{Enter}');
    await user.click(screen.getByRole('checkbox', { name: 'Mark Remove me complete' }));

    const row = screen.getByRole('listitem');
    await user.click(within(row).getByRole('button', { name: 'Delete Remove me' }));
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getAllByText('0', { selector: '.summary-number' })).toHaveLength(2);
    expect(window.localStorage.getItem('quicktask.tasks')).toBe('[]');
  });

  it('shows empty state and zero counts when no saved value exists', () => {
    window.localStorage.removeItem('quicktask.tasks');
    render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent('No tasks yet. Add your first task!');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.getAllByText('0', { selector: '.summary-number' })).toHaveLength(2);
  });

  it('shows empty state and zero counts when valid saved JSON is not an array', () => {
    window.localStorage.setItem('quicktask.tasks', JSON.stringify({ text: 'Not a task list' }));
    render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent('No tasks yet. Add your first task!');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.getAllByText('0', { selector: '.summary-number' })).toHaveLength(2);
  });

  it('restores valid saved tasks and safely ignores malformed stored data', () => {
    window.localStorage.setItem(
      'quicktask.tasks',
      JSON.stringify([{ id: 'saved-1', text: 'Saved task', completed: true }]),
    );
    const { unmount } = render(<App />);
    expect(screen.getByText('Saved task')).toHaveClass('is-complete');
    expect(screen.getByRole('checkbox', { name: 'Mark Saved task complete' })).toBeChecked();
    unmount();

    window.localStorage.setItem('quicktask.tasks', '{not valid json');
    render(<App />);
    expect(screen.getByRole('status')).toHaveTextContent('No tasks yet. Add your first task!');
  });

  it('filters invalid records from otherwise valid saved data', () => {
    window.localStorage.setItem(
      'quicktask.tasks',
      JSON.stringify([
        { id: 'valid', text: 'Keep this', completed: false },
        { id: 42, text: 'Invalid id', completed: false },
        { id: 'invalid-state', text: 'Invalid state', completed: 'no' },
      ]),
    );
    render(<App />);
    expect(screen.getByText('Keep this')).toBeInTheDocument();
    expect(screen.queryByText('Invalid id')).not.toBeInTheDocument();
    expect(screen.queryByText('Invalid state')).not.toBeInTheDocument();
  });

  it('handles storage access failures without crashing the task interface', () => {
    const getItem = window.Storage.prototype.getItem;
    const setItem = window.Storage.prototype.setItem;
    window.Storage.prototype.getItem = () => {
      throw new Error('Storage unavailable');
    };
    window.Storage.prototype.setItem = () => {
      throw new Error('Storage unavailable');
    };

    try {
      expect(() => render(<App />)).not.toThrow();
      expect(screen.getByRole('status')).toBeInTheDocument();
    } finally {
      window.Storage.prototype.getItem = getItem;
      window.Storage.prototype.setItem = setItem;
    }
  });
});
