import React from 'react';
import { AppProvider } from './AppContext';
import Notification from '../page/customer/customerComponent/Notification';
import AuthHandler from '../components/AuthHandler';

// This component can be used to wrap the entire app with our context providers
const GlobalContextProvider = ({ children }) => {
  return (
    <AppProvider>
      {children}
      <Notification />
      <AuthHandler />
    </AppProvider>
  );
};

export default GlobalContextProvider;
