require('./bootstrap');

import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { loadApiConfig } from './lib/apiConfig';
import App from './app';

// Load API configuration before rendering
loadApiConfig().then(() => {
    const router = createBrowserRouter([
        {
            path: '*',
            element: (
                <AuthProvider>
                    <ThemeProvider>
                        <App />
                    </ThemeProvider>
                </AuthProvider>
            ),
        }
    ], {
        future: {
            v7_startTransition: true,
            v7_relativeSplatPath: true
        }
    });

    const container = document.getElementById('root');
    const root = createRoot(container);

    root.render(
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>
    );
}).catch(error => {
    console.error('Failed to initialize app:', error);
});