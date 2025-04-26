import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

console.log('Main script executing - checking if root element exists:', !!document.getElementById('root'));

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found in the document!');
} else {
  console.log('Root element found, attempting to render app');
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
} 