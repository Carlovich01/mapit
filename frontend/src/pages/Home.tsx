import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export function Home() {
  const isAuthenticated = useAuth((state) => state.isAuthenticated);

  // Redirect to dashboard if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4 py-12">
        <h1 className="text-5xl font-bold">Bienvenido a MapIT</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Transforma tus PDFs en herramientas de aprendizaje interactivas con IA
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link to="/register">
            <Button size="lg">Comenzar Gratis</Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline">Iniciar Sesión</Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mapas Mentales IA</CardTitle>
            <CardDescription>
              Sube un PDF y obtén un mapa mental interactivo generado automáticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Visualiza conceptos y relaciones de forma clara y organizada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flashcards SM-2</CardTitle>
            <CardDescription>
              Sistema de repetición espaciada para optimizar tu aprendizaje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Revisa contenido en el momento óptimo para mejorar la retención
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Juego Interactivo</CardTitle>
            <CardDescription>
              Pon a prueba tu conocimiento reordenando mapas mentales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Aprende jugando mientras refuerzas tu comprensión
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

