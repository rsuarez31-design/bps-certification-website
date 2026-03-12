#!/bin/bash

# ========================================
# BPS Website - Configuración de Deployment
#
# Este script te ayuda a preparar el proyecto
# para subirlo a GitHub y desplegarlo en Vercel.
# ========================================

echo "🚀 BPS Website - Preparación para Deployment"
echo "=============================================="
echo ""

# Verificar que Git esté instalado
if ! command -v git &> /dev/null
then
    echo "❌ Git no está instalado."
    echo "Instálalo primero:"
    echo "  - macOS: Debería venir pre-instalado, o ejecuta: brew install git"
    echo "  - Windows: Descárgalo de https://git-scm.com/"
    echo ""
    exit 1
fi

echo "✅ Git instalado: $(git --version)"
echo ""

# Verificar que estemos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json"
    echo "Ejecuta este script desde el directorio bps-website:"
    echo "  cd /Users/ramonsuarez/Desktop/BPS/bps-website"
    echo "  bash deploy-setup.sh"
    echo ""
    exit 1
fi

echo "✅ Directorio correcto"
echo ""

# Verificar si Git ya está inicializado
if [ -d ".git" ]; then
    echo "✅ Git ya está inicializado"
else
    echo "📦 Inicializando Git..."
    git init
    echo "✅ Git inicializado"
fi
echo ""

# Verificar si el remoto está configurado
if git remote -v | grep -q "origin"; then
    echo "✅ Remoto de Git ya configurado:"
    git remote -v
else
    echo "⚠️  Remoto de Git no configurado todavía"
    echo ""
    echo "Próximos pasos:"
    echo "1. Crea un repositorio en GitHub: https://github.com/new"
    echo "2. Ejecuta estos comandos (reemplaza TU-USUARIO con tu usuario de GitHub):"
    echo ""
    echo "   git remote add origin https://github.com/TU-USUARIO/bps-certification-website.git"
    echo "   git branch -M main"
    echo "   git add ."
    echo "   git commit -m \"Commit inicial - BPS Website\""
    echo "   git push -u origin main"
    echo ""
fi

echo ""
echo "=========================================="
echo "📝 PRÓXIMOS PASOS:"
echo "=========================================="
echo ""
echo "1. Crear cuenta de GitHub (si no tienes):"
echo "   https://github.com"
echo ""
echo "2. Crear repositorio nuevo:"
echo "   https://github.com/new"
echo "   Nombre: bps-certification-website"
echo ""
echo "3. Subir tu código a GitHub (comandos arriba)"
echo ""
echo "4. Desplegar en Vercel:"
echo "   https://vercel.com"
echo "   - Regístrate con GitHub"
echo "   - Importa tu repositorio"
echo "   - Haz clic en Deploy"
echo ""
echo "5. Tu sitio estará disponible en:"
echo "   https://tu-proyecto.vercel.app"
echo ""
echo "=========================================="
echo "📖 Para instrucciones detalladas, lee:"
echo "   - GUIA_DE_DEPLOYMENT.md"
echo "   - INSTRUCCIONES_RAPIDAS.md"
echo "=========================================="
echo ""
