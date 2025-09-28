import React from 'react';
import { createRoot } from 'react-dom/client';
import { ProfileEditor } from './ProfileEditor';

const App: React.FC = () => {
  return (
    <div style={{ width: '400px', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#333' }}>
        Apply Anywhere
      </h1>
      <ProfileEditor />
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
