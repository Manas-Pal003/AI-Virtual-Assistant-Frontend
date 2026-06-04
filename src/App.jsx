import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AuthRoute from './Routes/AppRoutes';

const router = createBrowserRouter([
  ...AuthRoute
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;