import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { Home, Menu, X } from "lucide-react";
import { useAuth } from '../../context/AuthContext';
import { LogoutButton } from '../auth/LogoutButton';
import { useState } from 'react';
import { cn } from "../../lib/utils";
import { ThemeToggle } from "../theme/ThemeToggle"; // Added import

export const Header = () => {
  const { user, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navigationItems = [
    { label: "Prayer Requests", href: "/prayer-requests" },
    ...(user 
      ? [{ label: "My Profile", href: "/profile" }]
      : [
          { label: "Login", href: "/login" },
          { label: "Register", href: "/register" }
        ]
    ),
  ];

  return (
    <header className="fixed w-full top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Home className="w-5 h-5" />
              <span className="font-semibold text-lg">CryOutNow</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
            {!loading && !user && (
              <Button size="sm" className="ml-2" asChild>
                <Link to="/get-started">Get Started</Link>
              </Button>
            )}
            {user && <LogoutButton />}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <ThemeToggle /> {/* Added ThemeToggle */}
        </nav>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden fixed inset-x-0 top-16 bg-background border-b",
            "transition-[max-height] duration-300 ease-in-out overflow-hidden",
            isMenuOpen ? "max-h-screen" : "max-h-0"
          )}
        >
          <div className="container px-4 py-4 flex flex-col gap-4">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {!loading && !user && (
              <Button size="sm" className="w-full" asChild>
                <Link to="/get-started" onClick={() => setIsMenuOpen(false)}>
                  Get Started
                </Link>
              </Button>
            )}
            {user && (
              <div onClick={() => setIsMenuOpen(false)}>
                <LogoutButton />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};