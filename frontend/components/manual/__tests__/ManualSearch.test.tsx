import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ManualSearch from '../ManualSearch';

describe('ManualSearch', () => {
  it('renders placeholder from i18n', () => {
    render(<ManualSearch locale="es" />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('shows the matching process at the top when typing its title', async () => {
    const user = userEvent.setup();
    render(<ManualSearch locale="es" />);

    await user.click(screen.getByRole('searchbox'));
    await user.type(screen.getByRole('searchbox'), 'donar');

    const options = await screen.findAllByRole('option');
    expect(options.length).toBeGreaterThan(0);
    expect(options[0]).toHaveTextContent(/donar/i);
  });

  it('shows no-results message for unmatched query', async () => {
    const user = userEvent.setup();
    render(<ManualSearch locale="es" />);

    await user.click(screen.getByRole('searchbox'));
    await user.type(screen.getByRole('searchbox'), 'zxqvbnmplkj');

    expect(await screen.findByText(/Sin resultados/i)).toBeInTheDocument();
  });
});
