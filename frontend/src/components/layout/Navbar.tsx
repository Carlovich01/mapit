import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b bg-background w-full">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-full">
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="text-2xl font-bold text-primary flex-shrink-0">
          MapIT
        </Link>

        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hidden sm:block">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <span className="text-xs md:text-sm text-muted-foreground hidden md:block truncate max-w-[150px]">
                {user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Salir
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Iniciar Sesión</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Registrarse</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

