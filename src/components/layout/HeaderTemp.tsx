import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Home } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              <span className="font-semibold">CryOutNow</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/prayer-requests" className="text-sm text-muted-foreground hover:text-foreground">
              Prayer Requests
            </Link>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">Register</Link>
            </Button>
            <ModeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
};
