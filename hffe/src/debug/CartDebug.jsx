import React from 'react';
import { useAppContext } from '../context/AppContext';

const CartDebug = () => {
  const { cart } = useAppContext();

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '10px', 
      zIndex: 9999,
      maxWidth: '300px',
      maxHeight: '400px',
      overflow: 'auto',
      fontSize: '12px'
    }}>
      <h4>Cart Debug Info</h4>
      <p><strong>Cart Length:</strong> {cart.length}</p>
      <p><strong>Cart Items:</strong></p>
      <pre style={{ fontSize: '10px', maxHeight: '300px', overflow: 'auto' }}>
        {JSON.stringify(cart, null, 2)}
      </pre>
    </div>
  );
};

export default CartDebug;
