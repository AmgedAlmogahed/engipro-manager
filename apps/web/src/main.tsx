import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './router.js';
import './index.css';

/**
 * ADR-0050: React Router v7 in DECLARATIVE mode — browser history, not hash.
 * The frozen prototype uses HashRouter, which produces unshareable URLs and
 * breaks server-side route matching; a lint rule bans importing it.
 *
 * Framework mode is deliberately not used: it wants a server for loaders and
 * actions, and there is no work for that server to do when a standalone API
 * already owns the contract (ADR-0004).
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retrying a 403 is pointless and hides the distinction ADR-0047's
      // DataState primitive exists to preserve: a denied request is not a
      // failed one, and a user must be able to tell which they are looking at.
      retry: (failureCount, error) => {
        const status = (error as { status?: number }).status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});

const root = document.getElementById('root');
if (!root) throw new Error('#root is missing from index.html');

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
