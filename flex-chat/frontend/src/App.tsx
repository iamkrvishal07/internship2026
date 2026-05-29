import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

import "./App.css";

import routes from "./constants/routes/routes";
import LoginPage from "./pages/auth/LoginPage";
import OtpPage from "./pages/auth/OtpPage";
import SignUpPage from "./pages/auth/SignUpPage";
import ChatsListContainer from "./pages/chat/ChatListContainer";
import ChatPage from "./pages/chat/ChatPage";
import RootLayout from "./pages/RootLayout";
import UserListPage from "./pages/users/UserListPage";
import UserProfilePage from "./pages/users/UserProfilePage";
import ThemePage from "./pages/theme/ThemePage";
import CreateThemePage from "./pages/theme/CreateThemePage.tsx";
import NotFoundPage from "./pages/NotFoundPage";


const router = createBrowserRouter([
  {
    path: routes.index,
    element: <RootLayout />,
    children: [
      { 
        index: true, 
        element: <Navigate to={routes.chats} replace /> 
      },
      { 
        path: routes.login,
        element: <LoginPage /> 
      },
      { 
        path: routes.signup, 
        element: <SignUpPage />
      },
      {
        path: routes.verifyEmail,
        element: <OtpPage />,
      },
      {
        path: routes.chats,
        element: <ChatsListContainer />,
      },
      {
        path: routes.myProfile,
        element: <UserProfilePage />,
      },
      { 
        path: routes.users, 
        element: <UserListPage /> 
      },
      { path: routes.chat, 
        element: <ChatPage /> 
      },
      {
        path: routes.themes,
        element: <ThemePage />
      },
      {
        path: routes.themesCreate,
        element: <CreateThemePage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      }
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
