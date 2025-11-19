# Formación EFI 2025 - Checklist Dashboard

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/mateocruzalvarez7-8267s-projects/v0-formacion-efi-2025)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/gd1SRqtE7Tw)

## Descripción

Aplicación interactiva para gestionar y hacer seguimiento del proceso de formación EFI 2025 de la CUN (Corporación Unificada Nacional de Educación Superior).

## Características

- ✅ Seguimiento en tiempo real del progreso de formación
- 📊 Visualización por fases (Antes, Durante, Después)
- 💾 Guardado automático de registros en GitHub
- 🎯 Asignación de catalizador responsable
- 🎨 Interfaz moderna y responsiva
- 🌙 Soporte para modo oscuro

## Estructura de Fases

### 1. Antes de la Formación (8 tareas)
Preparación y logística previa a la sesión de formación.

### 2. Durante la Formación (6 tareas)
Ejecución y gestión de la sesión en tiempo real.

### 3. Después de la Formación (3 tareas)
Cierre, seguimiento y análisis post-formación.

## Configuración Requerida

### Variables de Entorno

Para que la funcionalidad de guardado en GitHub funcione, debes configurar las siguientes variables de entorno:

- `GITHUB_TOKEN`: Token de acceso personal de GitHub
- `GITHUB_REPO`: Nombre del repositorio (formato: `usuario/repositorio`)
- `GITHUB_BRANCH`: Rama del repositorio (opcional, por defecto: `main`)

**📖 Consulta [INSTRUCCIONES_GITHUB.md](./INSTRUCCIONES_GITHUB.md) para una guía detallada de configuración.**

### Cómo Configurar en Vercel

1. Ve a la sección **"Vars"** en el menú lateral izquierdo de v0
2. Agrega cada variable con su valor correspondiente
3. Guarda los cambios

## Uso

1. **Ingresar Nombre del Catalizador:** En el campo superior, ingresa el nombre del responsable del grupo
2. **Marcar Tareas:** Haz clic en cada checkbox para marcar las tareas como completadas
3. **Monitorear Progreso:** Observa la barra de progreso que se actualiza automáticamente
4. **Guardar Registros:** Haz clic en el botón "Enviar" para guardar el estado actual en GitHub

## Tecnologías Utilizadas

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19 + Tailwind CSS
- **Componentes:** shadcn/ui
- **Íconos:** Lucide React
- **Animaciones:** canvas-confetti
- **Almacenamiento:** GitHub API

## Deployment

Tu proyecto está desplegado en:

**[https://vercel.com/mateocruzalvarez7-8267s-projects/v0-formacion-efi-2025](https://vercel.com/mateocruzalvarez7-8267s-projects/v0-formacion-efi-2025)**

## Continuar Desarrollo

Continúa construyendo tu aplicación en:

**[https://v0.app/chat/gd1SRqtE7Tw](https://v0.app/chat/gd1SRqtE7Tw)**

## Estructura del Proyecto

\`\`\`
formacion-efi-2025/
├── app/
│   ├── api/
│   │   └── save-checklist/
│   │       └── route.ts          # API para guardar en GitHub
│   ├── layout.tsx                # Layout principal
│   ├── page.tsx                  # Página principal
│   └── globals.css               # Estilos globales
├── components/
│   ├── checklist-dashboard.tsx   # Componente principal del checklist
│   └── ui/                       # Componentes UI de shadcn
├── INSTRUCCIONES_GITHUB.md       # Guía de configuración de GitHub
└── README.md                     # Este archivo
\`\`\`

## Soporte

Si encuentras algún problema o tienes preguntas:
- Revisa [INSTRUCCIONES_GITHUB.md](./INSTRUCCIONES_GITHUB.md) para problemas relacionados con GitHub
- Continúa la conversación en [v0.app](https://v0.app/chat/gd1SRqtE7Tw)

---

Desarrollado con ❤️ para mejorar el proceso de formación EFI 2025
