import { createBrowserRouter } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { Activity } from "@/pages/Activity";
import { Reports } from "@/pages/Reports";
import { Settings } from "@/pages/Settings";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/", element: <Dashboard /> },
          { path: "/activity", element: <Activity /> },
          { path: "/reports", element: <Reports /> },
          { path: "/settings", element: <Settings /> },
        ],
      },
    ],
  },
]);
