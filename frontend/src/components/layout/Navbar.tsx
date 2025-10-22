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
    <nav className="border-b bg-background w-full">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-full">
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 flex-shrink-0">
          <img src={LogoMapit} alt="MapIT Logo" className="h-10 w-10" />
          <span className="text-2xl font-bold text-primary">MapIT</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {isAuthenticated ? (
            <>
              <span className="text-xs md:text-sm text-muted-foreground truncate max-w-[100px] md:max-w-[150px]">
                {user?.full_name}
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

