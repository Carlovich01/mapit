# Script para ver logs coloridos de Docker Compose (PowerShell)
# Uso: .\docker-logs.ps1 [servicio]

Write-Host "🐳 MapIT - Visor de Logs con Colores`n" -ForegroundColor Blue

# Si no se proporciona argumento, mostrar menú
if ($args.Count -eq 0) {
    Write-Host "Selecciona qué logs ver:" -ForegroundColor Yellow
    Write-Host "1) Todos los servicios"
    Write-Host "2) Backend"
    Write-Host "3) Frontend"
    Write-Host "4) Base de datos"
    Write-Host "5) Adminer"
    Write-Host ""
    
    $option = Read-Host "Opción (1-5)"
    
    switch ($option) {
        "1" {
            Write-Host "`n✓ Mostrando logs de TODOS los servicios`n" -ForegroundColor Green
            docker-compose logs -f
        }
        "2" {
            Write-Host "`n✓ Mostrando logs del BACKEND`n" -ForegroundColor Green
            docker-compose logs -f backend
        }
        "3" {
            Write-Host "`n✓ Mostrando logs del FRONTEND`n" -ForegroundColor Green
            docker-compose logs -f frontend
        }
        "4" {
            Write-Host "`n✓ Mostrando logs de la BASE DE DATOS`n" -ForegroundColor Green
            docker-compose logs -f db
        }
        "5" {
            Write-Host "`n✓ Mostrando logs de ADMINER`n" -ForegroundColor Green
            docker-compose logs -f adminer
        }
        default {
            Write-Host "⚠ Opción inválida" -ForegroundColor Yellow
            exit 1
        }
    }
} else {
    # Si se proporciona argumento, usarlo directamente
    Write-Host "✓ Mostrando logs de: $($args[0])`n" -ForegroundColor Green
    docker-compose logs -f $args[0]
}

