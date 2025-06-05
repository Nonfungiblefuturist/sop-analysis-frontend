import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the workflow header', () => {
  render(<App />);
  const heading = screen.getByText(/Lincoln University Admission Workflow Tool/i);
  expect(heading).toBeInTheDocument();
});
