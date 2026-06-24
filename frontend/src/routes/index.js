import React from "react";
import { useRoutes, Navigate } from "react-router-dom";

import AuthGuards from "../guards/authGuard";
import NoAuthGuards from "../guards/noauthGuard";
import TaskTable from "../pages/table/TaskTable";
import Login from "../pages/auth/Login";
import EmployeeTable from "../pages/table/EmployeeTable";
import MainLayout from "../components/Layout/MainLayout";
import ActiveAcc from "../pages/activeAcc/ActiveAcc";
import ChatPage from "../pages/message/ChatPage";

export default function Router() {
  const routing = useRoutes([
    {
      path: "/active-account",
      element: <ActiveAcc />,
    },
    {
      path: "/",
      element: <NoAuthGuards />,
      children: [
        {
          path: "/",
          element: <Navigate to="/signin" />,
        },
        {
          path: "/signin",
          element: <Login />,
        },
      ],
    },
    {
      path: "/",
      element: <AuthGuards />,
      children: [
        {
          path: "/",
          element: <MainLayout />,
          children: [
            {
              index: true,
              element: <Navigate to="/tasks" />,
            },
            {
              path: "/employees",
              element: <EmployeeTable />,
            },
            {
              path: "/tasks",
              element: <TaskTable />,
            },
              {
              path: "/messages",
              element: <ChatPage />,
            },
          ],
        },
        {
          path: "/",
          element: <Navigate to="/employees" />,
        },
      ],
    },
    {
      path: "*",
      element: <div style={{ padding: 24 }}>404 - Page not found</div>,
    },
  ]);

  return routing;
}
