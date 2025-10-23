import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { RegisterForm } from '../components/auth/RegisterForm';

export function Register() {
  const isAuthenticated = useAuth((state) => state.isAuthenticated);

  // Redirigir al panel de control si ya ha iniciado sesión
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <RegisterForm />
      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-primary hover:underline">
          Inicia sesión aquí
        </Link>
      </p>
    </div>
  );
}

