import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { seedDemoCustomer } from './lib/customerStore';
import './index.css';
import App from './App';

seedDemoCustomer();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
