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
    return <div>Cargando...</div>;
  }

  if (!mindMap) {
    return <div>Mapa mental no encontrado</div>;
  }

  if (gameResult) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
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

            <div className="flex gap-2 justify-center">
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
    );
  }

  if (!gameStarted) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
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
              <Link to={`/mind-maps/${id}`}>
                <Button variant="outline" size="lg">Cancelar</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <GameBoard mindMap={mindMap} onComplete={handleComplete} />
    </div>
  );
}

