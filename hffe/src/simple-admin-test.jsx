import React from 'react';

const SimpleAdminTest = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ color: '#333' }}>Simple Admin Test</h1>
      <p>This is a test to see if admin components can render properly.</p>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        marginTop: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>Dashboard Test</h2>
        <p>If you can see this, the routing is working!</p>
      </div>
    </div>
  );
};

export default SimpleAdminTest;
