import { useNavigate, useLocation } from "react-router-dom";
import { HiUsers, HiLogout, HiChat } from "react-icons/hi";
import { MdPalette } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import React, { useState } from "react";


import routes from "../../constants/routes/routes";
import { useLogout } from "../../hooks/tanstackQuery/useAccountApi";
import ConfirmModal from "../common/ConfirmModal";

const NavBtn = ({
  icon,
  label,
  onClick,
  active = false,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
}) => {
  if (danger) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
      >
        {icon}
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
        ${active
          ? "bg-black text-white"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        }`}
    >
      {icon}
      {label}
    </button>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logoutMutation = useLogout();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logoutMutation.mutate();
    setConfirmLogout(false);
  };

  return (
    <>
      <nav className="relative w-full px-8 py-3 bg-white border-b border-gray-200 flex items-center justify-end">
        <div
          onClick={() => navigate(routes.chats)}
          className="cursor-pointer absolute left-6 top-1/2 -translate-y-1/2"
        >
          <img
            src="/flexChatLogo.png"
            alt="FlexChat Logo"
            className="w-[100pt] h-[80pt] object-contain"
          />
        </div>

        <div className="flex items-center gap-1">
          <NavBtn
            icon={<HiChat size={16} />}
            label="Chats"
            active={isActive(routes.chats)}
            onClick={() => navigate(routes.chats)}
          />
  
          <NavBtn
            icon={<HiUsers size={16} />}
            label="Users"
            active={isActive(routes.users)}
            onClick={() => navigate(routes.users)}
          />
          <NavBtn
            icon={<CgProfile size={16} />}
            label="Profile"
            active={isActive(routes.myProfile)}
            onClick={() => navigate(routes.myProfile)}
          />

          <div className="w-px h-5 bg-gray-200 mx-2" />

          <NavBtn
            icon={<MdPalette size={18} />}
            label="Themes"
            onClick={()=> navigate(routes.themes)} 
          />
          <NavBtn
            icon={<HiLogout size={18} />}
            label="Logout"
            danger
            onClick={() => setConfirmLogout(true)}
          />
        </div>
      </nav>

      <ConfirmModal
        isOpen={confirmLogout}
        title="Log out"
        message="Are you sure you want to log out?"
        confirmText="Log out"
        variant="danger"
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </>
  );
};

export default Navbar;