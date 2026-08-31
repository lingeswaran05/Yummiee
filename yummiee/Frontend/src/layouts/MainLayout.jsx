import {
  Heart,
  Home,
  LogOut,
  Plus,
  ShoppingCart,
  UserRound,
  Utensils,
  X,
} from "lucide-react";
import { useState } from "react";
import { Show, useClerk, useUser } from "@clerk/react";
import { NavLink, useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";

function MainLayout({ children }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { user } = useUser();

  const handleLogout = async () => {
    setProfileOpen(false);
    try {
      await signOut();
    } catch (err) {
      console.warn("Clerk signout completed with notice:", err);
    } finally {
      // Cleanly navigate back to login route
      navigate("/", { replace: true });
    }
  };

  const mobileItems = [
    {
      name: "Home",
      path: "/dashboard",
      icon: Home,
    },
    {
      name: "Cook",
      path: "/what-can-i-cook",
      icon: Utensils,
    },
    {
      name: "My Recipes",
      path: "/my-recipes",
      icon: Plus,
    },
    {
      name: "Wishlist",
      path: "/wishlist",
      icon: Heart,
    },
    {
      name: "Shopping",
      path: "/shopping-list",
      icon: ShoppingCart,
    },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background overflow-x-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex min-h-screen w-full flex-1 flex-col pb-24 md:pb-0 md:pl-64 lg:pl-72 overflow-x-hidden">
        {children}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-[#e4e2e1] bg-white/95 px-1 py-1.5 backdrop-blur-md pb-[max(8px,env(safe-area-inset-bottom))] md:hidden shadow-lg">
        {mobileItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold transition ${
                  isActive
                    ? "text-primary font-bold"
                    : "text-text-secondary hover:text-text-primary"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold text-text-secondary hover:text-text-primary transition"
          aria-label="Open profile menu"
        >
          <UserRound className="h-5 w-5" />
          <span>Profile</span>
        </button>
      </nav>

      {profileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Profile menu">
          <button
            type="button"
            onClick={() => setProfileOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            aria-label="Close profile menu"
          />
          <section className="absolute bottom-[72px] left-3 right-3 rounded-2xl border border-[#e4e2e1] bg-white p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-text-primary">My Account</h2>
              <button type="button" onClick={() => setProfileOpen(false)} className="rounded-lg p-1 text-text-secondary hover:bg-[#f6f3f2]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <Show when="signed-in">
              <div className="mb-4 rounded-xl bg-[#faf8f7] p-3 border border-[#e4e2e1]">
                <p className="font-bold text-text-primary">{user?.fullName || user?.firstName || "My Profile"}</p>
                <p className="truncate text-xs text-text-secondary">{user?.primaryEmailAddress?.emailAddress || ""}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-primary-dark"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </button>
            </Show>

            <Show when="signed-out">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/", { replace: true });
                }}
                className="flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-primary-dark"
              >
                Sign in
              </button>
            </Show>
          </section>
        </div>
      )}
    </div>
  );
}

export default MainLayout;
