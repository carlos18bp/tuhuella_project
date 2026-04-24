import React from 'react';
import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DropdownMenu, { DropdownDivider } from '../DropdownMenu';

function makeDropdown(overrides: Partial<React.ComponentProps<typeof DropdownMenu>> = {}) {
  return render(
    <DropdownMenu
      trigger={({ getTriggerProps }) => (
        <button {...(getTriggerProps() as object)}>Open</button>
      )}
      {...overrides}
    >
      <a role="menuitem" href="#one" tabIndex={-1}>One</a>
      <a role="menuitem" href="#two" tabIndex={-1}>Two</a>
      <a role="menuitem" href="#three" tabIndex={-1}>Three</a>
    </DropdownMenu>,
  );
}

describe('DropdownMenu', () => {
  it('renders the trigger and hides the panel initially', () => {
    makeDropdown();
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens the panel when trigger is clicked', async () => {
    makeDropdown();
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('sets aria-expanded to false on trigger when closed', () => {
    makeDropdown();
    expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('sets aria-expanded to true on trigger when open', async () => {
    makeDropdown();
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('sets aria-haspopup="menu" on the trigger', () => {
    makeDropdown();
    expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('wires aria-controls on trigger to the panel id', async () => {
    makeDropdown();
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    const trigger = screen.getByRole('button', { name: 'Open' });
    const panel = screen.getByRole('menu');
    expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
  });

  it('closes the panel on outside mousedown', async () => {
    makeDropdown();
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes the panel on Escape key', async () => {
    makeDropdown();
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('moves focus to next menuitem on ArrowDown', async () => {
    makeDropdown();
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    const items = screen.getAllByRole('menuitem');
    items[0].focus();

    fireEvent.keyDown(document, { key: 'ArrowDown' });

    expect(document.activeElement).toBe(items[1]);
  });

  it('moves focus to previous menuitem on ArrowUp', async () => {
    makeDropdown();
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    const items = screen.getAllByRole('menuitem');
    items[2].focus();

    fireEvent.keyDown(document, { key: 'ArrowUp' });

    expect(document.activeElement).toBe(items[1]);
  });

  it('moves focus to first menuitem on Home key', async () => {
    makeDropdown();
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    const items = screen.getAllByRole('menuitem');
    items[2].focus();

    fireEvent.keyDown(document, { key: 'Home' });

    expect(document.activeElement).toBe(items[0]);
  });

  it('moves focus to last menuitem on End key', async () => {
    makeDropdown();
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    const items = screen.getAllByRole('menuitem');
    items[0].focus();

    fireEvent.keyDown(document, { key: 'End' });

    expect(document.activeElement).toBe(items[items.length - 1]);
  });

  it('calls onOpen when the panel opens', async () => {
    const onOpen = jest.fn();
    makeDropdown({ onOpen });
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('does not call onOpen when the panel closes', async () => {
    const onOpen = jest.fn();
    makeDropdown({ onOpen });
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('sets data-testid on the panel when panelTestId is provided', async () => {
    makeDropdown({ panelTestId: 'my-panel' });
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByTestId('my-panel')).toBeInTheDocument();
  });

  it('renders children as a render prop receiving close', async () => {
    const onClose = jest.fn();
    render(
      <DropdownMenu
        trigger={({ getTriggerProps }) => (
          <button {...(getTriggerProps() as object)}>Open</button>
        )}
      >
        {({ close }) => (
          <button role="menuitem" onClick={() => { close(); onClose(); }}>Close Me</button>
        )}
      </DropdownMenu>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Close Me' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});

describe('DropdownDivider', () => {
  it('renders a separator element', () => {
    const { container } = render(<DropdownDivider />);
    const divider = container.firstChild as HTMLElement;
    expect(divider).toBeInTheDocument();
    expect(divider.tagName).toBe('DIV');
  });
});
