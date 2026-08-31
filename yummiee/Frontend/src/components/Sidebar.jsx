import {
  LayoutDashboard,
  BookOpen,
  Heart,
  ShoppingCart,
  ChefHat,
  LogIn,
  UserPlus,
  Utensils,
} from "lucide-react";
import {
  Show,
  UserButton,
  SignInButton,
  SignUpButton,
  useUser,
} from "@clerk/react";
import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const { user } = useUser();

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "What Can I Cook?",
      path: "/what-can-i-cook",
      icon: Utensils,
    },
    {
      name: "My Recipes",
      path: "/my-recipes",
      icon: BookOpen,
    },
    {
      name: "Wishlist",
      path: "/wishlist",
      icon: Heart,
    },
    {
      name: "Shopping List",
      path: "/shopping-list",
      icon: ShoppingCart,
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col justify-between border-r border-[#e4e2e1] bg-white md:flex lg:w-72">
      {/* Top */}
      <div className="flex flex-col gap-8 overflow-y-auto p-6">
        {/* Logo */}
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-left transition hover:opacity-85"
        >
          <ChefHat className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-primary">
            Yummiee
          </span>
        </button>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl p-3 transition-colors ${
                    isActive
                      ? "bg-primary/10 font-bold text-primary"
                      : "text-text-secondary hover:bg-[#f6f3f2] hover:text-primary"
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Auth / Profile */}
      <div className="border-t border-[#e4e2e1] p-6">
        <Show when="signed-in">
          <div className="flex items-center gap-3 rounded-xl bg-[#faf8f7] p-3 border border-[#e4e2e1]">
            <UserButton />
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-semibold text-text-primary">
                {user?.fullName || user?.firstName || "My Profile"}
              </span>
              <span className="truncate text-xs text-text-secondary">
                {user?.primaryEmailAddress?.emailAddress || ""}
              </span>
            </div>
          </div>
        </Show>

        <Show when="signed-out">
          <div className="flex flex-col gap-2">
            <SignInButton mode="modal">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(174,49,21,0.2)] transition hover:bg-primary-dark"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#e4e2e1] bg-white px-4 py-2 text-sm font-semibold text-text-secondary transition hover:bg-[#f6f3f2] hover:text-primary"
              >
                <UserPlus className="h-4 w-4" />
                <span>Sign Up</span>
              </button>
            </SignUpButton>
          </div>
        </Show>
      </div>
    </aside>
  );
}

export default Sidebar;