import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { App } from './App';
import { httpClient } from './api/client';
import type { AccountsSnapshot } from './types';

const incomplete: AccountsSnapshot = {
  readyCount: 1, totalCount: 2, canSubmit: false,
  accounts: [
    { id: '1', provider: { id: 'barclays', name: 'Barclays' }, statement: { fileName: 'current.pdf', date: '2026-07-01' }, status: 'UPLOADED' },
    { id: '2', provider: { id: 'hsbc', name: 'HSBC' }, statement: null, status: 'MISSING' }
  ]
};

describe('Connect accounts page', () => {
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it('keeps submission disabled while any provider needs attention', async () => {
    vi.spyOn(httpClient, 'request').mockResolvedValue({ data: incomplete });
    render(<App />);
    expect(await screen.findByText('1 statement needs attention')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit statements/i })).toBeDisabled();
  });

  it('filters rows without changing overall readiness', async () => {
    const user = userEvent.setup();
    vi.spyOn(httpClient, 'request').mockResolvedValue({ data: incomplete });
    render(<App />);
    await screen.findByText('HSBC');
    await user.selectOptions(screen.getByLabelText('Show'), 'UPLOADED');
    expect(screen.getByText('Barclays')).toBeInTheDocument();
    expect(screen.queryByText('HSBC')).not.toBeInTheDocument();
    expect(screen.getByText('1 statement needs attention')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit statements/i })).toBeDisabled();
  });

  it('explains what the statement statuses mean', async () => {
    const user = userEvent.setup();
    vi.spyOn(httpClient, 'request').mockResolvedValue({ data: incomplete });
    render(<App />);

    await user.hover(await screen.findByText('Missing', { selector: 'span' }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'No statement has been added. Upload a statement to continue.'
    );

    await user.unhover(screen.getByText('Missing', { selector: 'span' }));
    await user.hover(screen.getByText('Current', { selector: 'span' }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'This statement is recent and ready to submit.'
    );
  });

  it('requires a new file when replacing and sends only its name and date', async () => {
    const user = userEvent.setup();
    const request = vi.spyOn(httpClient, 'request').mockResolvedValue({ data: incomplete });
    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'Replace' }));

    const saveButton = screen.getByRole('button', { name: 'Save statement' });
    expect(saveButton).toBeDisabled();
    expect(screen.getByText(/only the file name is recorded/i)).toBeInTheDocument();

    await user.upload(
      screen.getByLabelText(/Statement file/),
      new File(['not transmitted'], 'replacement.pdf', { type: 'application/pdf' })
    );
    expect(saveButton).toBeEnabled();

    await user.click(saveButton);

    expect(request).toHaveBeenCalledWith({
      method: 'PUT',
      url: '/accounts/1/statement',
      data: { fileName: 'replacement.pdf', statementDate: '2026-07-01' }
    });
  });

  it('shows the success state after a valid server-confirmed submission', async () => {
    const user = userEvent.setup();
    const complete = { ...incomplete, readyCount: 2, canSubmit: true, accounts: incomplete.accounts.map(account => ({ ...account, statement: account.statement ?? { fileName: 'hsbc.pdf', date: '2026-07-02' }, status: 'UPLOADED' as const })) };
    vi.spyOn(httpClient, 'request').mockImplementation((config) => Promise.resolve({
      data: config.url === '/submissions' ? { status: 'SUBMITTED', message: 'Done' } : complete
    }));
    render(<App />);
    await user.click(await screen.findByRole('button', { name: /submit statements/i }));
    await waitFor(() => expect(screen.getByText('Your statements are on their way')).toBeInTheDocument());
  });
});
