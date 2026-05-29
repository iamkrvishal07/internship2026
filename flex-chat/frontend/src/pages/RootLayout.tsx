import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Loader from "../components/common/Loader";
import ToastListener from "../components/common/ToastListener";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/NavBar";
import { useRetryPendingMessages } from "../hooks/signalR/useRetryPendingMessage";
import { useSignalrConnection } from "../hooks/signalR/useSignalrConnection";
import { useSignalRGlobalListeners } from "../hooks/signalR/useSignalrGlobalEvents";
import { useAuthBootstrap } from "../hooks/useAuthBootstrap";
import useQueryParams from "../hooks/useQueryParams";
import { useAuthStore } from "../stores/authStore";


export default function RootLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.accessToken);
  const { chatId } = useQueryParams();
  const { loading } = useAuthBootstrap();

  useSignalrConnection(loading ? null : token);
  useSignalRGlobalListeners(Number(chatId));
  useRetryPendingMessages();

  if (loading) return <Loader />;

  return (
     <>
    <ToastContainer position="bottom-right" autoClose={3000} />
    <ToastListener />

    <div className="h-screen flex flex-col overflow-hidden">
      
      {isAuthenticated && (
        <div className="shrink-0">
          <Navbar />
        </div>
      )}

 <main className="flex-1 min-h-0 overflow-y-auto">
  <Outlet />
</main>

      <div className="shrink-0">
        <Footer />
      </div>
      
    </div>
  </>
  );
}