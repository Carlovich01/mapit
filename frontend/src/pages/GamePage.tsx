import { useState, useEffect } from 'react';
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
  const [bestScore, setBestScore] = useState<{ score: number; time: number } | null>(null);

  // Cargar el mejor puntaje previo
  useEffect(() => {
    const loadBestScore = async () => {
      if (!id) return;
      
      try {
        const sessions = await gameService.listGameSessions(id, 100);
        const completedSessions = sessions.filter(s => s.completed && s.score !== null);
        
        if (completedSessions.length > 0) {
          // Encontrar la sesión con mejor puntaje
          const best = completedSessions.reduce((prev, current) => {
            // Priorizar por puntaje, y en caso de empate, por menor tiempo
            if (current.score > prev.score) return current;
            if (current.score === prev.score && 
                current.time_elapsed_seconds !== null && 
                prev.time_elapsed_seconds !== null &&
                current.time_elapsed_seconds < prev.time_elapsed_seconds) {
              return current;
            }
            return prev;
          });
          
          setBestScore({
            score: best.score,
            time: best.time_elapsed_seconds || 0
          });
        }
      } catch (error) {
        console.error('Error loading best score:', error);
      }
    };
    
    loadBestScore();
  }, [id]);

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
      
      // Actualizar el mejor puntaje si este resultado es mejor
      if (!bestScore || result.score > bestScore.score || 
          (result.score === bestScore.score && timeElapsed < bestScore.time)) {
        setBestScore({ score: result.score, time: timeElapsed });
      }
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
    const isNewRecord = bestScore && (
      gameResult.score > bestScore.score || 
      (gameResult.score === bestScore.score && gameResult.time < bestScore.time)
    );
    
    return (
      <div className="h-screen flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                {isNewRecord ? '🎉 ¡Nuevo Récord!' : '¡Juego Completado!'}
              </CardTitle>
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
                
                {isNewRecord && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                      ⭐ ¡Has superado tu récord anterior!
                    </p>
                  </div>
                )}
                
                {bestScore && !isNewRecord && (
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Tu mejor resultado es:</p>
                    <p className="text-sm font-semibold">
                      {bestScore.score}% en {Math.floor(bestScore.time / 60)}:{(bestScore.time % 60).toString().padStart(2, '0')}
                    </p>
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

          {bestScore && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-primary mb-1">🏆 Tu Mejor Resultado</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-bold text-2xl text-primary">
                      {bestScore.score}%
                    </span>
                    <span className="text-muted-foreground">
                      en {Math.floor(bestScore.time / 60)}:{(bestScore.time % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
                {bestScore.score === 100 && (
                  <div className="text-3xl">⭐</div>
                )}
              </div>
            </div>
          )}

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
                  {bestScore ? 'Jugar de Nuevo' : 'Comenzar Juego'}
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

