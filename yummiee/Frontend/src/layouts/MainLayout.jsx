import {
  Heart,
  Home,
  Plus,
  ShoppingCart,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import Sidebar from "../components/Sidebar";

function MainLayout({ children }) {
  const mobileItems = [
    {
      name: "Home",
      path: "/dashboard",
      icon: Home,
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
    {
      name: "Add",
      path: "/add-recipe",
      icon: Plus,
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

      </nav>
    </div>
  );
}

export default MainLayout;