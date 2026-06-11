import Login from "../Pages/Auth/Login";
import Register from "../Pages/Auth/Register";
import NotFound from "../Pages/NotFoundpage";
import Unauthorized from "../Pages/Auth/Unauthorized";
import Customize from "../Pages/Customize";
import Dashboard from "../Pages/Dashboard";


const AuthRoute = [
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
        path: '/unauthorized',
        element: <Unauthorized />,
    },
    {
        path:"/customize",
        element:<Customize />
    },
    {
        path: '/dashboard',
        element: <Dashboard />,
    },
    {
        path: "*",
        element: <NotFound />,
    },
];

export default AuthRoute;