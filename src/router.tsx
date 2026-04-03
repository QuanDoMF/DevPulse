import { createBrowserRouter } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { Projects } from "@/pages/Projects";
import { Tasks } from "@/pages/Tasks";
import { Notes } from "@/pages/Notes";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/projects", element: <Projects /> },
      { path: "/tasks", element: <Tasks /> },
      { path: "/notes", element: <Notes /> },
    ],
  },
]);
