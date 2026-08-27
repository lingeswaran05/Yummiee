import {
  Heart,
  Home,
  LogOut,
  Plus,
  ShoppingCart,
  UserRound,
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

  const mobileItems = [
    {
      name: "Home",
      path: "/dashboard",
      icon: Home,
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
    <div className="flex min-h-screen w-full bg-background">

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex min-h-screen flex-1 flex-col pb-20 md:pb-0 md:pl-64 lg:pl-72">
        {children}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-[#e4e2e1] bg-white/95 px-2 py-2 backdrop-blur-md md:hidden">

        {mobileItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-semibold ${
                  isActive
                    ? "text-primary"
                    : "text-text-secondary"
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
          className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-semibold text-text-secondary"
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
            className="absolute inset-0 bg-black/30"
            aria-label="Close profile menu"
          />
          <section className="absolute bottom-[68px] left-3 right-3 rounded-2xl border border-[#e4e2e1] bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-text-primary">Profile</h2>
              <button type="button" onClick={() => setProfileOpen(false)} className="rounded-lg p-1 text-text-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>

            <Show when="signed-in">
              <div className="mb-4 rounded-xl bg-[#faf8f7] p-3">
                <p className="font-semibold text-text-primary">{user?.fullName || user?.firstName || "My Profile"}</p>
                <p className="truncate text-sm text-text-secondary">{user?.primaryEmailAddress?.emailAddress || ""}</p>
              </div>
              <button
                type="button"
                onClick={() => signOut({ redirectUrl: "/#/?signed_out=1" })}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-white"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </Show>

            <Show when="signed-out">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/");
                }}
                className="flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 font-semibold text-white"
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
