import { createBrowserRouter } from 'react-router-dom';

/**
 * createBrowserRouter, never createHashRouter (ADR-0050).
 *
 * Routes arrive with their modules. Screens are mined from the frozen prototype
 * (ADR-0003) rather than copied: its behaviour is a validated executable
 * specification, but its types inline interactions[], documents[] and
 * statusHistory[] on Client — a screen projection, not an aggregate (ADR-0002).
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <p className="p-6 text-sm">Engipro ERP — shell. Modules arrive with W3/W4.</p>,
  },
]);
