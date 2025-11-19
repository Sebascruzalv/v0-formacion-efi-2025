import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    console.log("[v0] API Route called")
    console.log("[v0] GITHUB_TOKEN exists:", !!process.env.GITHUB_TOKEN)
    console.log("[v0] GITHUB_REPO exists:", !!process.env.GITHUB_REPO)

    const data = await request.json()
    
    // Verificar que tenemos el token de GitHub
    const githubToken = process.env.GITHUB_TOKEN
    const githubRepo = process.env.GITHUB_REPO // formato: "usuario/repositorio"
    const githubBranch = process.env.GITHUB_BRANCH || 'main'
    
    if (!githubToken || !githubRepo) {
      console.error("[v0] Missing environment variables")
      return NextResponse.json(
        { error: 'Configuración de GitHub incompleta. Por favor configure GITHUB_TOKEN y GITHUB_REPO en las variables de entorno.' },
        { status: 500 }
      )
    }

    const [owner, repoName] = githubRepo.split("/")
    console.log("[v0] Parsed repo:", { owner, repoName })

    if (!owner || !repoName) {
      console.error("[v0] Invalid repo format")
      return NextResponse.json(
        { error: "Formato de repositorio inválido. Debe ser 'usuario/repositorio'" },
        { status: 500 }
      )
    }

    // Crear el nombre del archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `registros/${data.catalystName.replace(/\s+/g, '_')}_${timestamp}.json`
    
    // Verificar primero si el repositorio existe y es accesible
    try {
      const repoCheckUrl = `https://api.github.com/repos/${githubRepo}`
      const repoCheckResponse = await fetch(repoCheckUrl, {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!repoCheckResponse.ok) {
        if (repoCheckResponse.status === 404) {
          throw new Error(`El repositorio "${githubRepo}" no existe o el token no tiene acceso.`)
        } else if (repoCheckResponse.status === 401) {
          throw new Error('Token de GitHub inválido o expirado.')
        } else {
          throw new Error(`Error verificando repositorio: ${repoCheckResponse.statusText}`)
        }
      }
    } catch (error) {
      console.error('[v0] Repo check failed:', error)
      // Si falla la verificación del repo, lanzamos el error para detener el proceso
      // Pero si es un error de red (fetch throws), lo dejamos pasar para que falle más adelante o se maneje en el catch principal
      if (error instanceof Error && (error.message.includes('no existe') || error.message.includes('Token'))) {
        throw error
      }
    }

    // Obtener el contenido actual del archivo (si existe)
    const getFileUrl = `https://api.github.com/repos/${githubRepo}/contents/${filename}`
    let sha: string | undefined
    
    try {
      const getResponse = await fetch(getFileUrl, {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })
      
      if (getResponse.ok) {
        const fileData = await getResponse.json()
        sha = fileData.sha
      }
    } catch (error) {
      // El archivo no existe, está bien
      console.log('[v0] File does not exist yet (or fetch failed), will create new one')
    }
    
    // Preparar el contenido
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64')
    
    // Crear o actualizar el archivo en GitHub
    const updateUrl = `https://api.github.com/repos/${githubRepo}/contents/${filename}`
    
    try {
      const updateResponse = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Actualización de checklist - ${data.catalystName} - ${new Date().toLocaleString('es-ES')}`,
          content,
          branch: githubBranch,
          ...(sha && { sha })
        }),
      })

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json().catch(() => ({}))
        console.error('[v0] GitHub API error:', updateResponse.status, errorData)
        
        if (updateResponse.status === 404) {
           throw new Error(`No se encontró el repositorio "${githubRepo}" o la ruta del archivo.`)
        }
        
        throw new Error(errorData.message || `Error al guardar en GitHub (${updateResponse.status})`)
      }

      const result = await updateResponse.json()
      
      return NextResponse.json({ 
        success: true, 
        message: 'Datos guardados correctamente en GitHub',
        fileUrl: result.content.html_url
      })
    } catch (error) {
      // Capturar errores específicos de fetch si lanza excepciones en 404
      if (error instanceof Error && error.message.includes('404')) {
         throw new Error(`No se encontró el repositorio "${githubRepo}". Verifique el nombre y los permisos del token.`)
      }
      throw error
    }
    
  } catch (error) {
    console.error('[v0] Error in save-checklist API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido al guardar los datos' },
      { status: 500 }
    )
  }
}
