import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMindMap } from '../hooks/useMindMap';
import { GameBoard } from '../components/game/GameBoard';
import { gameService } from '../services/gameService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export function GamePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mindMap, loading } = useMindMap(id);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameResult, setGameResult] = useState<{ score: number; time: number } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleStartGame = async () => {
    if (!id) return;
    
    try {
      const session = await gameService.createGameSession(id);
      setSessionId(session.id);
      setGameStarted(true);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const handleComplete = async (
    edges: Array<{ source: string; target: string }>,
    timeElapsed: number
  ) => {
    if (!sessionId) return;

    try {
      const result = await gameService.completeGameSession(sessionId, edges, timeElapsed);
      setGameResult({ score: result.score, time: timeElapsed });
      setGameStarted(false);
    } catch (error) {
      console.error('Error completing game:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  if (!mindMap) {
    return <div className="flex items-center justify-center h-screen">Mapa mental no encontrado</div>;
  }

  if (gameResult) {
    return (
      <div className="h-screen flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">¡Juego Completado!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div>
                  <div className="text-6xl font-bold text-primary">
                    {gameResult.score}%
                  </div>
                  <p className="text-muted-foreground">Puntuación</p>
                </div>
                
                <div>
                  <div className="text-2xl font-semibold">
                    {Math.floor(gameResult.time / 60)}:{(gameResult.time % 60).toString().padStart(2, '0')}
                  </div>
                  <p className="text-sm text-muted-foreground">Tiempo transcurrido</p>
                </div>

                {gameResult.score === 100 && (
                  <div className="text-lg font-semibold text-green-600">
                    ¡Perfecto! Todas las conexiones son correctas
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-center flex-wrap">
                <Button onClick={() => {
                  setGameResult(null);
                  setSessionId(null);
                }}>
                  Jugar de Nuevo
                </Button>
                <Link to={`/mind-maps/${id}`}>
                  <Button variant="outline">Ver Mapa Mental</Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline">Volver al Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="h-screen flex items-center justify-center px-4">
        <div className="max-w-2xl w-full space-y-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Juego de Reordenamiento</h1>
            <p className="text-muted-foreground">
              Mapa: {mindMap.title}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Instrucciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                En este juego, se desordenarán los nodos del mapa mental.
                Tu objetivo es reconectar todos los nodos en la estructura correcta.
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Arrastra los nodos para organizarlos</li>
                <li>Haz clic y arrastra desde un nodo hacia otro para crear una conexión</li>
                <li>Intenta recrear todas las conexiones del mapa original</li>
                <li>Tu puntuación se basará en la precisión de las conexiones</li>
              </ul>
              <div className="flex gap-2">
                <Button onClick={handleStartGame} size="lg" className="flex-1">
                  Comenzar Juego
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header personalizado */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex-shrink-0"
              >
                ← Volver
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl md:text-2xl font-bold truncate">Juego de Reordenamiento</h1>
                {mindMap && (
                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                    Mapa: {mindMap.title}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablero de juego que ocupa todo el espacio restante */}
      <div className="flex-1 overflow-hidden">
        <GameBoard mindMap={mindMap} onComplete={handleComplete} />
      </div>
    </div>
  );
}

