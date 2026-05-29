import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

import routes from "../constants/routes/routes";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-5">
          <HiOutlineExclamationCircle
            size={42}
            className="text-red-500"
          />
        </div>

        <p className="text-sm font-semibold text-red-500 tracking-wide uppercase mb-2">
          404 Error
        </p>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Page not found
        </h1>

        <p className="text-sm text-gray-500 leading-6 mb-7">
          The page you are looking for does not exist or may have been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 h-11 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>

          <button
            onClick={() => navigate(routes.chats)}
            className="flex-1 h-11 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors"
          >
            Go to Chats
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;