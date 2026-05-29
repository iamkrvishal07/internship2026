import { useRef, useEffect, useState } from "react";
import { HiChevronDown, HiCheck } from "react-icons/hi";
import { toast } from "react-toastify";

import { useGetChatPreference, useUpdateChatPreference } from "../../hooks/tanstackQuery/useChatPreferenceApi";
import { useGetAllThemes } from "../../hooks/tanstackQuery/useThemeApi";
import { DEFAULT_PAGE_SIZE } from "../../constants/defaults";
import FONTS from "../../constants/fonts";

type ChatPreferenceMenuProps = {
  chatId: number;
  isOpen: boolean;
  onClose: () => void;
};

const ChatPreferenceMenu = ({ chatId, isOpen, onClose }: ChatPreferenceMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [nickname, setNickname] = useState("");

  const { data: chatPreferences } = useGetChatPreference(chatId);
  const { data: themesData = [] } = useGetAllThemes({ page: 1, pageSize: DEFAULT_PAGE_SIZE });
  const themes = Array.isArray(themesData) ? themesData : [];

  const { mutate: updatePreference, isPending: isUpdating } = useUpdateChatPreference();

  useEffect(() => {
    setNickname(chatPreferences?.nickname ?? "");
  }, [chatPreferences?.nickname]);

  const handleSaveNickname = () => {
    if (!chatPreferences) return;
    updatePreference({
      chatId,
      request: { ...chatPreferences, nickname: nickname.trim() || null },
    });
  };

  // const handleToggleMute = () => {
  //   if (!chatPreferences) return;
  //   updatePreference({
  //     chatId,
  //     request: { ...chatPreferences, isMuted: !chatPreferences.isMuted },
  //   });
  // };

  // const handleTogglePin = () => {
  //   if (!chatPreferences) return;
  //   updatePreference({
  //     chatId,
  //     request: { ...chatPreferences, isPinned: !chatPreferences.isPinned },
  //   });
  // };

  // const handleToggleArchive = () => {
  //   if (!chatPreferences) return;
  //   updatePreference({
  //     chatId,
  //     request: { ...chatPreferences, isArchived: !chatPreferences.isArchived },
  //   });
  // };

  const handleSetTheme = (themeId: number) => {
    if (!chatPreferences) return;
    updatePreference({ chatId, request: { ...chatPreferences, themeId } });
    setShowThemeDropdown(false);
    toast.success("Theme updated");
  };

  const handleRemoveTheme = () => {
    if (!chatPreferences) return;
    updatePreference({ chatId, request: { ...chatPreferences, themeId: null } });
    setShowThemeDropdown(false);
    toast.success("Theme removed");
  };

  const handleSetFont = (fontName: string) => {
    if (!chatPreferences) return;
    updatePreference({ chatId, request: { ...chatPreferences, fontName } });
    setShowFontDropdown(false);
    toast.success("Font updated");
  };

  const handleRemoveFont = () => {
    if (!chatPreferences) return;
    updatePreference({ chatId, request: { ...chatPreferences, fontName: FONTS[0] } });
    setShowFontDropdown(false);
    toast.success("Font removed");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen || !chatPreferences) return null;

  return (
    <div
      ref={menuRef}
      className="absolute top-12 right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-64 overflow-hidden"
    >
      <div className="p-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Chat Preferences</h3>
      </div>

      <div className="divide-y divide-gray-100 overflow-y-auto max-h-[70vh]">
        <div className="px-4 py-3 space-y-2">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
            Nickname
          </label>
          <div className="flex items-center gap-2 w-full min-w-0">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Set chat nickname"
              className="flex-1 min-w-0 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            <button
              onClick={handleSaveNickname}
              disabled={isUpdating}
              className="shrink-0 whitespace-nowrap px-3 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>

        <div>
          <button
            onClick={() => {
              setShowThemeDropdown((p) => !p);
              setShowFontDropdown(false);
            }}
            disabled={isUpdating}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <span className="text-sm text-gray-700">Theme</span>
            <HiChevronDown
              size={16}
              className={`text-gray-400 transition-transform duration-200 ${showThemeDropdown ? "rotate-180" : ""}`}
            />
          </button>

          {showThemeDropdown && (
            <div className="border-t border-gray-700 bg-gray-900 max-h-48 overflow-y-auto">
              <button
                onClick={handleRemoveTheme}
                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors ${
                  !chatPreferences.themeId ? "bg-gray-800 text-white" : "text-gray-200 hover:bg-gray-800"
                }`}
              >
                <span>Default</span>
                {!chatPreferences.themeId && <HiCheck size={16} />}
              </button>

              {themes.map((theme: any) => (
                <button
                  key={theme.id}
                  onClick={() => handleSetTheme(theme.id)}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors ${
                    chatPreferences.themeId === theme.id ? "bg-gray-800 text-white" : "text-gray-200 hover:bg-gray-800"
                  }`}
                >
                  <span>{theme.name}</span>
                  {chatPreferences.themeId === theme.id && <HiCheck size={16} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => {
              setShowFontDropdown((p) => !p);
              setShowThemeDropdown(false);
            }}
            disabled={isUpdating}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <span className="text-sm text-gray-700">Font</span>
            <HiChevronDown
              size={16}
              className={`text-gray-400 transition-transform duration-200 ${showFontDropdown ? "rotate-180" : ""}`}
            />
          </button>

          {showFontDropdown && (
            <div className="border-t border-gray-700 bg-gray-900 max-h-48 overflow-y-auto">
              <button
                onClick={handleRemoveFont}
                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors ${
                  !chatPreferences.fontName ? "bg-gray-800 text-white" : "text-gray-200 hover:bg-gray-800"
                }`}
              >
                <span>Default</span>
                {!chatPreferences.fontName && <HiCheck size={16} />}
              </button>

              {FONTS.map((font) => (
                <button
                  key={font}
                  onClick={() => handleSetFont(font)}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors ${
                    chatPreferences.fontName === font ? "bg-gray-800 text-white" : "text-gray-200 hover:bg-gray-800"
                  }`}
                >
                  <span style={{ fontFamily: font }}>{font}</span>
                  {chatPreferences.fontName === font && <HiCheck size={16} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPreferenceMenu;