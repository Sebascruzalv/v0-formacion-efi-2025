# Configuración de GitHub para Guardar Registros

Esta aplicación guarda automáticamente los registros del checklist de formación en un repositorio de GitHub.

## Variables de Entorno Requeridas

Para que la funcionalidad de guardado funcione correctamente, necesitas configurar las siguientes variables de entorno en tu proyecto de Vercel:

### 1. GITHUB_TOKEN

**Descripción:** Token de acceso personal de GitHub con permisos para escribir en el repositorio.

**Cómo obtenerlo:**
1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Haz clic en "Generate new token (classic)"
3. Dale un nombre descriptivo (ej: "Formación EFI 2025 - Checklist")
4. Selecciona los siguientes permisos:
   - `repo` (acceso completo a repositorios privados)
5. Genera el token y cópialo inmediatamente (no podrás verlo de nuevo)

**Valor esperado:** `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 2. GITHUB_REPO

**Descripción:** Nombre del repositorio donde se guardarán los registros.

**Formato:** `usuario/nombre-repositorio`

**Ejemplo:** `Sebascruzalv/formacion-efi-registros`

### 3. GITHUB_BRANCH (Opcional)

**Descripción:** Rama del repositorio donde se guardarán los archivos.

**Valor por defecto:** `main`

**Ejemplo:** `main` o `registros`

## Cómo Configurar en Vercel

### Opción 1: Desde la interfaz de v0
1. Haz clic en el menú lateral izquierdo
2. Selecciona "Vars" (Variables de entorno)
3. Agrega cada variable con su valor correspondiente

### Opción 2: Desde el Dashboard de Vercel
1. Ve a tu proyecto en Vercel
2. Navega a Settings → Environment Variables
3. Agrega las tres variables:
   - `GITHUB_TOKEN`: Tu token personal de GitHub
   - `GITHUB_REPO`: `usuario/repositorio`
   - `GITHUB_BRANCH`: `main` (opcional)

## Estructura de Archivos Guardados

Los registros se guardarán en la carpeta `registros/` del repositorio con el siguiente formato de nombre:

\`\`\`
registros/Nombre_Catalizador_2025-01-15T10-30-45-123Z.json
\`\`\`

Cada archivo contiene:
- Nombre del catalizador
- Fecha y hora del registro
- Porcentaje de progreso
- Estado de todas las tareas (completadas/pendientes)
- Detalles de cada fase

## Ejemplo de Contenido del Archivo

\`\`\`json
{
  "catalystName": "Juan Pérez",
  "date": "2025-01-15T10:30:45.123Z",
  "progressPercentage": 75,
  "completedTasks": 13,
  "totalTasks": 17,
  "phases": [
    {
      "id": "antes",
      "title": "Antes de la Formación",
      "tasks": [
        {
          "id": "a1",
          "text": "Reserva del espacio físico o virtual (Meet)",
          "completed": true
        }
      ]
    }
  ]
}
\`\`\`

## Solución de Problemas

### Error: "Configuración de GitHub incompleta"
- Verifica que hayas agregado correctamente las variables `GITHUB_TOKEN` y `GITHUB_REPO`
- Asegúrate de que no haya espacios adicionales en los valores

### Error: "Error al guardar en GitHub"
- Verifica que el token tenga los permisos correctos (`repo`)
- Confirma que el nombre del repositorio sea correcto (formato: `usuario/repositorio`)
- Asegúrate de que el token no haya expirado

### Error: "404 Not Found"
- El repositorio no existe o el nombre está mal escrito
- El token no tiene acceso al repositorio especificado

## Recomendaciones

1. **Repositorio Privado:** Usa un repositorio privado para proteger los datos de los catalizadores
2. **Backup Regular:** Considera hacer backups periódicos del repositorio
3. **Rotación de Tokens:** Renueva el token de GitHub periódicamente por seguridad
4. **Monitoreo:** Revisa regularmente los archivos guardados para asegurar que todo funcione correctamente
