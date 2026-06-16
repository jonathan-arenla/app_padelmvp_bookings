#!/bin/bash
cd "$(dirname "$0")"
export EXPO_PROJECT_ROOT=$(pwd)

echo "=========================================="
echo "🎾 PadelMVP - Gestor de Despliegue 🎾"
echo "=========================================="
echo "Elige una opción:"
echo "1) 💻 Modo Desarrollo (Iniciar servidor y mostrar QR)"
echo "2) 📱 Abrir en Simulador iOS (Desarrollo)"
echo "3) 🚀 Instalar en iPhone Físico (Producción / 7 días)"
echo "4) ❌ Salir"
echo "=========================================="

read -p "Selecciona una opción [1-4]: " opcion

case $opcion in
    1)
        echo ""
        echo "Iniciando servidor de desarrollo..."
        /opt/homebrew/opt/node@20/bin/npx expo start
        ;;
    2)
        echo ""
        echo "Compilando y abriendo en el Simulador iOS..."
        npx expo run:ios
        ;;
    3)
        echo ""
        echo "Compilando versión Release para tu iPhone físico..."
        echo "⚠️  Asegúrate de tener el iPhone conectado por cable y desbloqueado."
        echo "Node version: $(node -v)"
        EXPO_PROJECT_ROOT=$(pwd) CI=1 EXPO_NO_INTERACTIVE=1 /opt/homebrew/opt/node@20/bin/npx expo run:ios --configuration Release --device 00008140-000E698A0C6A801C --port 8082
        ;;
    4)
        echo "Saliendo..."
        exit 0
        ;;
    *)
        echo "Opción no válida."
        exit 1
        ;;
esac
