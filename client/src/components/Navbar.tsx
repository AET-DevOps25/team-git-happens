
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/services/AuthService';
import { GraduationCap, ChevronDown, BookOpen, Star } from 'lucide-react';

const Navbar = () => {
  const { student, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex">
          <Link to="/" className="flex items-center space-x-2 mr-6">
            <img src="/app-logo.png" alt="Course Compass Logo" className="h-8 w-8" /> 
            <span className="font-bold text-lg">Course Compass</span>
          </Link>

          <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
            <NavLink
              to="/courses"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`
              }
            >
              Browse Courses
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink
                  to="/recommend"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-primary ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`
                  }
                >
                  Get Recommendations
                </NavLink>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1">
                  <span>{student?.name}</span>
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/my-subjects')}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  My Courses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/my-reviews')}>
                  <Star className="w-4 h-4 mr-2" />
                  My Reviews
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" onClick={() => navigate('/login')}>
              Log in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
