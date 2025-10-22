import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import LogoMapit from '../../assets/LogoMapit.svg';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b bg-white w-full">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-full">
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 flex-shrink-0">
          <img src={LogoMapit} alt="MapIT Logo" className="h-10 w-10" />
          <span className="text-2xl font-bold text-primary">MapIT</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {isAuthenticated && (
            <>
              <div className="flex items-center gap-2">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2} 
                  stroke="currentColor" 
                  className="w-5 h-5 text-primary flex-shrink-0"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <span className="text-xs md:text-sm text-muted-foreground truncate max-w-[100px] md:max-w-[150px]">
                  {user?.full_name}
                </span>
              </div>
              <Button variant="default" size="sm" onClick={handleLogout}>
                Salir
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

