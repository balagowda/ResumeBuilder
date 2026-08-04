import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// App owns the router outlet, so a test has to supply the Router itself and
// pick the entry route.
const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );

describe('App shell', () => {
  test('renders the landing page with the brand in the heading', () => {
    renderAt('/');

    // The brand name has to appear in the page's own <h1>. It is the signal
    // search engines match the query "hatchresume" against, and the site went
    // a long time calling itself "resumebuilder" everywhere instead.
    expect(
      screen.getByRole('heading', { level: 1, name: /HatchResume/i })
    ).toBeInTheDocument();
  });

  test('links to the other pages from the footer', () => {
    renderAt('/');

    for (const name of [/Resume Templates/i, /Resume Examples/i, /ATS Checker/i, /FAQ/i]) {
      expect(screen.getAllByRole('link', { name }).length).toBeGreaterThan(0);
    }
  });

  test('renders a content page route from the shared page data', () => {
    renderAt('/faq');

    expect(
      screen.getByRole('heading', { level: 1, name: /Frequently Asked Questions/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/What is HatchResume\?/i)).toBeInTheDocument();
  });

  test('keeps the document title in step with the route', () => {
    renderAt('/faq');

    expect(document.title).toMatch(/HatchResume FAQ/i);
  });

  test('makes the selected template available as a selectable PDF export', async () => {
    renderAt('/template7');

    expect(
      await screen.findByRole('button', { name: 'Download PDF' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Image PDF' })).toBeInTheDocument();
  });
});
