import Login from "../Pages/Auth/Login";
import Register from "../Pages/Auth/Register";
import ForgotPassword from "../Pages/Auth/ForgotPassword";
import NotFound from "../Pages/NotFoundpage";
import Customize from "../Pages/Customize";
import Dashboard from "../Pages/Dashboard";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";


const AuthRoute = [
    {
        element:<PublicRoute />,
        children:[
        {
        path: '/',
        element: <Login />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/register',
        element: <Register />,
    },
    {
        path: '/forgot-password',
        element: <ForgotPassword />,
    },
        ]
    },
    {
        element:<ProtectedRoute />,
        children:[
    {
        path:"/customize",
        element:<Customize />
    }
        ]
    },
    {
        element:<ProtectedRoute requireAssistant={true}/>,
        children:[
    {
        path: '/dashboard',
        element: <Dashboard />,
    },
    ]
    },
    {
        path: "*",
        element: <NotFound />,
    },
    

];

export default AuthRoute;