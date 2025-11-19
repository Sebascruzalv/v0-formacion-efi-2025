'use client'

import { Button } from "@/components/ui/button"
import { FileDown, Loader2 } from 'lucide-react'
import { useState } from "react"

type Task = {
  id: string
  text: string
  completed: boolean
  notes?: string
  photos?: string[]
  priority?: string
  completionTime?: string
}

type Phase = {
  id: string
  title: string
  tasks: Task[]
}

type PDFData = {
  catalystName: string
  date: string
  week: number
  progressPercentage: number
  completedTasks: number
  totalTasks: number
  phases: Phase[]
  stats: {
    currentStreak: number
    totalPoints: number
    weeklyCompletions: number
  }
}

export function PDFGenerator({ data }: { data: PDFData }) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async () => {
    setIsGenerating(true)
    
    try {
      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #10b981; padding-bottom: 20px; }
            .logo { width: 80px; height: 80px; background: #10b981; color: white; display: inline-flex; align-items: center; justify-content: center; border-radius: 12px; font-size: 32px; font-weight: bold; }
            h1 { color: #10b981; margin: 20px 0 10px; font-size: 32px; }
            .subtitle { color: #666; font-size: 16px; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
            .stat-card { background: #f3f4f6; padding: 20px; border-radius: 8px; text-center; }
            .stat-value { font-size: 28px; font-weight: bold; color: #10b981; }
            .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
            .phase { margin: 30px 0; page-break-inside: avoid; }
            .phase-header { background: #10b981; color: white; padding: 15px; border-radius: 8px 8px 0 0; font-size: 20px; font-weight: bold; }
            .phase-blue { background: #0ea5e9; }
            .phase-orange { background: #f97316; }
            .task { padding: 15px; border-left: 4px solid #e5e7eb; margin: 10px 0; background: #fafafa; }
            .task-completed { border-left-color: #10b981; background: #f0fdf4; }
            .task-title { font-weight: 600; margin-bottom: 5px; }
            .task-note { font-size: 14px; color: #666; margin-top: 10px; padding: 10px; background: white; border-radius: 4px; }
            .priority-high { border-left-color: #ef4444 !important; }
            .priority-medium { border-left-color: #f59e0b !important; }
            .footer { margin-top: 50px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
            .signature { margin-top: 60px; }
            .signature-line { width: 300px; border-top: 2px solid #333; margin: 0 auto; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">CUN</div>
            <h1>Reporte de Formación EFI 2025</h1>
            <p class="subtitle">Catalizador administrativo EFI - Semana ${data.week}</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${data.progressPercentage}%</div>
              <div class="stat-label">Progreso Total</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${data.stats.currentStreak}</div>
              <div class="stat-label">Racha Actual</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${data.stats.totalPoints}</div>
              <div class="stat-label">Puntos</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${data.completedTasks}/${data.totalTasks}</div>
              <div class="stat-label">Tareas Completadas</div>
            </div>
          </div>

          ${data.phases.map((phase, index) => `
            <div class="phase">
              <div class="phase-header ${index === 1 ? 'phase-blue' : index === 2 ? 'phase-orange' : ''}">
                ${phase.title}
              </div>
              ${phase.tasks.map(task => `
                <div class="task ${task.completed ? 'task-completed' : ''} ${task.priority ? `priority-${task.priority}` : ''}">
                  <div class="task-title">
                    ${task.completed ? '✓' : '○'} ${task.text}
                  </div>
                  ${task.priority ? `<div style="font-size: 12px; color: ${task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#10b981'};">Prioridad: ${task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}</div>` : ''}
                  ${task.notes ? `<div class="task-note"><strong>Nota:</strong> ${task.notes}</div>` : ''}
                  ${task.photos && task.photos.length > 0 ? `<div style="font-size: 12px; color: #666; margin-top: 5px;">📷 ${task.photos.length} foto(s) adjunta(s)</div>` : ''}
                </div>
              `).join('')}
            </div>
          `).join('')}

          <div class="signature">
            <p style="text-align: center; margin-bottom: 40px;"><strong>Catalizador Encargado:</strong></p>
            <div class="signature-line">${data.catalystName}</div>
          </div>

          <div class="footer">
            <p>Generado el ${new Date(data.date).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}</p>
            <p>Corporación Unificada Nacional de Educación Superior - CUN</p>
          </div>
        </body>
        </html>
      `

      // Create a blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Reporte_EFI_Semana${data.week}_${data.catalystName.replace(/\s+/g, '_')}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating}
      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generando...
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" />
          Descargar Reporte
        </>
      )}
    </Button>
  )
}
