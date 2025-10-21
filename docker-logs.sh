#!/bin/bash
# Script para ver logs coloridos de Docker Compose
# Uso: ./docker-logs.sh [servicio]

# Colores para el script
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 MapIT - Visor de Logs con Colores${NC}\n"

# Si no se proporciona argumento, mostrar menú
if [ -z "$1" ]; then
    echo -e "${YELLOW}Selecciona qué logs ver:${NC}"
    echo "1) Todos los servicios"
    echo "2) Backend"
    echo "3) Frontend"
    echo "4) Base de datos"
    echo "5) Adminer"
    echo ""
    read -p "Opción (1-5): " option
    
    case $option in
        1)
            echo -e "\n${GREEN}✓ Mostrando logs de TODOS los servicios${NC}\n"
            docker-compose logs -f
            ;;
        2)
            echo -e "\n${GREEN}✓ Mostrando logs del BACKEND${NC}\n"
            docker-compose logs -f backend
            ;;
        3)
            echo -e "\n${GREEN}✓ Mostrando logs del FRONTEND${NC}\n"
            docker-compose logs -f frontend
            ;;
        4)
            echo -e "\n${GREEN}✓ Mostrando logs de la BASE DE DATOS${NC}\n"
            docker-compose logs -f db
            ;;
        5)
            echo -e "\n${GREEN}✓ Mostrando logs de ADMINER${NC}\n"
            docker-compose logs -f adminer
            ;;
        *)
            echo -e "${YELLOW}⚠ Opción inválida${NC}"
            exit 1
            ;;
    esac
else
    # Si se proporciona argumento, usarlo directamente
    echo -e "${GREEN}✓ Mostrando logs de: $1${NC}\n"
    docker-compose logs -f "$1"
fi

