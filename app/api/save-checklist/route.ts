import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Verificar que tenemos el token de GitHub
    const githubToken = process.env.GITHUB_TOKEN
    const githubRepo = process.env.GITHUB_REPO // formato: "usuario/repositorio"
    const githubBranch = process.env.GITHUB_BRANCH || 'main'
    
    if (!githubToken || !githubRepo) {
      return NextResponse.json(
        { error: 'Configuración de GitHub incompleta. Por favor configure GITHUB_TOKEN y GITHUB_REPO en las variables de entorno.' },
        { status: 500 }
      )
    }

    // Crear el nombre del archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `registros/${data.catalystName.replace(/\s+/g, '_')}_${timestamp}.json`
    
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
      console.log('[v0] File does not exist yet, will create new one')
    }
    
    // Preparar el contenido
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64')
    
    // Crear o actualizar el archivo en GitHub
    const updateUrl = `https://api.github.com/repos/${githubRepo}/contents/${filename}`
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
      const errorData = await updateResponse.json()
      console.error('[v0] GitHub API error:', errorData)
      throw new Error(errorData.message || 'Error al guardar en GitHub')
    }

    const result = await updateResponse.json()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Datos guardados correctamente en GitHub',
      fileUrl: result.content.html_url
    })
    
  } catch (error) {
    console.error('[v0] Error in save-checklist API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido al guardar los datos' },
      { status: 500 }
    )
  }
}
