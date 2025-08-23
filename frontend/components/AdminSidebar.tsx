"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { FiHome } from "react-icons/fi";
import { FaUsers, FaCrown } from "react-icons/fa";
import { RiLogoutCircleLine } from "react-icons/ri";
import { IoCodeSlashOutline, IoPeopleOutline } from "react-icons/io5";
import { MdOutlineAutoStories } from "react-icons/md";

const SIDEBAR_WIDTH = {
  expanded: "w-56",
  collapsed: "w-16",
};

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
}

const menu = [
  {
    icon: <FiHome />,
    label: "Home",
    href: "/admin/",
  },
  {
    icon: <FaUsers />,
    label: "Users",
    href: "/admin/users",
  },
    {
    icon: <IoPeopleOutline />,
    label: "Public Users",
    href: "/admin/public-users",
  },
  {
    icon: <IoCodeSlashOutline />,
    label: "Prompts",
    href: "/admin/prompts",
  },
  {
    icon: <MdOutlineAutoStories />,
    label: "Stories",
    href: "/admin/stories",
  }, 
  {
    icon: <FaCrown />,
    label: "Plans",
    href: "/admin/plans",
  },
];

export default function Sidebar({ expanded, onToggle }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    function onResize() {
      setMobile(window.innerWidth < 768);
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (mobile && expanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobile, expanded]);

  const logout = () => {
    localStorage.clear();
    router.push("/admin/login");
  };

  return (
    <>
      {mobile && expanded && (
        <div
          className="fixed inset-0 z-20 bg-[#00000029] md:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed z-30 top-0 left-0 h-full transition-all duration-300 bg-[#A8DADC] border-r border-gray-200 flex flex-col shadow-lg ${
          expanded ? SIDEBAR_WIDTH.expanded : SIDEBAR_WIDTH.collapsed
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
          <div className="flex items-center gap-3">
            <div
              onClick={onToggle}
              className="w-10 h-10 cursor-pointer rounded-xl bg-white flex items-center justify-center shadow-sm border border-white"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#0ea5e9"
                  strokeWidth="2.5"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="5"
                  fill="#fff"
                  stroke="#0ea5e9"
                  strokeWidth="2"
                />
              </svg>
            </div>
            {expanded && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800">
                  AI Story
                </span>
                <span className="text-xs text-slate-600">Admin Panel</span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3 py-6">
          <ul className="space-y-2">
            {menu.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <li key={index}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                      expanded ? "" : "justify-center"
                    } ${
                      isActive
                        ? "bg-[#1D3557] text-white shadow-sm"
                        : "text-[#1D3557] hover:bg-[#1D3557] hover:text-white"
                    }`}
                  >
                    <span className="flex-shrink-0 transition-colors">
                      {item.icon}
                    </span>
                    {expanded && (
                      <span className="text-sm font-medium truncate">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200/50">
          <button
            className={`flex w-full items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group text-[#1D3557] hover:bg-[#1D3557] hover:text-white ${
              expanded ? "" : "justify-center"
            }`}
            onClick={() => logout()}
          >
            <span className="flex-shrink-0 transition-colors">
              <RiLogoutCircleLine />
            </span>
            {expanded && (
              <span className="text-sm font-medium truncate">Logout</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
