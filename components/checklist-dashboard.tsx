'use client'

import { useState, useEffect } from 'react'
import { Check, Calendar, Users, MapPin, ChevronDown, ChevronUp, Trophy, ArrowRight, User, Send, Loader2 } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import confetti from 'canvas-confetti'
import { useToast } from "@/hooks/use-toast"

// Definición de tipos para las tareas y fases
type Task = {
  id: string
  text: string
  completed: boolean
  responsible?: string
}

type Phase = {
  id: string
  title: string
  color: 'green' | 'blue' | 'orange'
  tasks: Task[]
}

// Datos iniciales basados en la imagen proporcionada
const initialPhases: Phase[] = [
  {
    id: 'antes',
    title: 'Antes de la Formación',
    color: 'green',
    tasks: [
      { id: 'a1', text: 'Reserva del espacio físico o virtual (Meet)', completed: false },
      { id: 'a2', text: 'Definir participación de las áreas en la formación', completed: false },
      { id: 'a3', text: 'Verificar el aseo y mantenimiento de la sala', completed: false },
      { id: 'a4', text: 'Verificar cámara, micrófono, televisor o videobeam', completed: false },
      { id: 'a5', text: 'Crear ficha de calificación individual', completed: false },
      { id: 'a6', text: 'Confirmar disponibilidad del formador y asistentes', completed: false },
      { id: 'a7', text: 'Enviar invitación formal con agenda, enlace (Grupo de whatsapp)', completed: false },
      { id: 'a8', text: 'Validar lista de asistencia previa y teléfonos de contacto', completed: false },
    ]
  },
  {
    id: 'durante',
    title: 'Durante la Formación',
    color: 'blue',
    tasks: [
      { id: 'd1', text: 'Verificar asistencia puntual (Llamar si no se conectan)', completed: false },
      { id: 'd2', text: 'Garantizar la entrega del colaborador (nuevo) al equipo de formación', completed: false },
      { id: 'd3', text: 'Iniciar sesión (temas, reglas, responsables, mensaje inspirador)', completed: false },
      { id: 'd4', text: 'Enviar invitación del día siguiente', completed: false },
      { id: 'd5', text: 'Dejar el espacio físico limpio y ordenado', completed: false },
      { id: 'd6', text: 'Entregar material de conexión usado a tecnología', completed: false },
    ]
  },
  {
    id: 'despues',
    title: 'Después de la Formación',
    color: 'orange',
    tasks: [
      { id: 'p1', text: 'Actualizar formulario de evaluación y base de ingresos 2025', completed: false },
      { id: 'p2', text: 'Acompañar ingreso del colaborador al área correspondiente', completed: false },
      { id: 'p3', text: 'Analizar retroalimentación para mejorar sesiones', completed: false },
    ]
  }
]

export function ChecklistDashboard() {
  const [phases, setPhases] = useState<Phase[]>(initialPhases)
  const [expandedPhase, setExpandedPhase] = useState<string | null>('antes')
  const [catalystName, setCatalystName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Calcular progreso total
  const totalTasks = phases.reduce((acc, phase) => acc + phase.tasks.length, 0)
  const completedTasks = phases.reduce((acc, phase) => 
    acc + phase.tasks.filter(t => t.completed).length, 0
  )
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100)

  // Efecto de confeti al completar todo
  useEffect(() => {
    if (progressPercentage === 100) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
  }, [progressPercentage])

  const toggleTask = (phaseId: string, taskId: string) => {
    setPhases(phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          tasks: phase.tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        }
      }
      return phase
    }))
  }

  const togglePhase = (phaseId: string) => {
    setExpandedPhase(expandedPhase === phaseId ? null : phaseId)
  }

  // Función para obtener estilos según el color de la fase
  const getPhaseStyles = (color: string) => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/30',
          border: 'border-emerald-200 dark:border-emerald-800',
          text: 'text-emerald-700 dark:text-emerald-400',
          badge: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-300',
          progress: 'bg-emerald-500'
        }
      case 'blue':
        return {
          bg: 'bg-sky-50 dark:bg-sky-950/30',
          border: 'border-sky-200 dark:border-sky-800',
          text: 'text-sky-700 dark:text-sky-400',
          badge: 'bg-sky-100 text-sky-800 hover:bg-sky-200 dark:bg-sky-900 dark:text-sky-300',
          progress: 'bg-sky-500'
        }
      case 'orange':
        return {
          bg: 'bg-orange-50 dark:bg-orange-950/30',
          border: 'border-orange-200 dark:border-orange-800',
          text: 'text-orange-700 dark:text-orange-400',
          badge: 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300',
          progress: 'bg-orange-500'
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          badge: 'bg-gray-100',
          progress: 'bg-gray-500'
        }
    }
  }

  const handleSaveData = async () => {
    if (!catalystName.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingrese el nombre del catalizador encargado antes de enviar.",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)

    try {
      const dataToSave = {
        catalystName,
        date: new Date().toISOString(),
        progressPercentage,
        completedTasks,
        totalTasks,
        phases: phases.map(phase => ({
          id: phase.id,
          title: phase.title,
          tasks: phase.tasks.map(task => ({
            id: task.id,
            text: task.text,
            completed: task.completed
          }))
        }))
      }

      const response = await fetch('/api/save-checklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al guardar los datos')
      }

      toast({
        title: "Guardado exitoso",
        description: `Los registros de ${catalystName} han sido guardados correctamente en GitHub.`,
        className: "bg-emerald-600 text-white"
      })

      // Confeti al guardar exitosamente
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      })

    } catch (error) {
      console.error('[v0] Error saving data:', error)
      toast({
        title: "Error al guardar",
        description: error instanceof Error ? error.message : "No se pudieron guardar los registros. Intente nuevamente.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-emerald-200 dark:shadow-none shrink-0">
              CUN
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Formación EFI 2025
              </h1>
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                Checklist de Control
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="hidden md:block w-48">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500 dark:text-gray-400">Progreso General</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </header>
          
        {/* Phases Grid */}
        <div className="grid gap-6">
          {phases.map((phase) => {
            const styles = getPhaseStyles(phase.color)
            const phaseCompleted = phase.tasks.filter(t => t.completed).length
            const phaseTotal = phase.tasks.length
            const isComplete = phaseCompleted === phaseTotal
            const isExpanded = expandedPhase === phase.id

            return (
              <Card 
                key={phase.id} 
                className={cn(
                  "transition-all duration-300 overflow-hidden border-l-4",
                  styles.border,
                  isComplete ? "opacity-90" : "opacity-100"
                )}
                style={{ borderLeftColor: isComplete ? undefined : '' }}
              >
                <div 
                  className={cn(
                    "p-4 md:p-6 cursor-pointer flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                    isExpanded ? "border-b border-gray-100 dark:border-gray-800" : ""
                  )}
                  onClick={() => togglePhase(phase.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                      isComplete ? "bg-emerald-500 text-white" : styles.bg
                    )}>
                      {isComplete ? <Check className="w-6 h-6" /> : (
                        <span className={cn("font-bold text-lg", styles.text)}>
                          {phase.id === 'antes' ? '1' : phase.id === 'durante' ? '2' : '3'}
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                        {phase.title}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={cn("font-normal", styles.badge)}>
                          {phaseCompleted}/{phaseTotal} Completado
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {phase.tasks.map((task) => (
                        <div 
                          key={task.id}
                          className={cn(
                            "flex items-start gap-4 p-4 md:p-5 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/30",
                            task.completed ? "bg-gray-50/30 dark:bg-gray-900/30" : ""
                          )}
                        >
                          <Checkbox 
                            id={task.id}
                            checked={task.completed}
                            onCheckedChange={() => toggleTask(phase.id, task.id)}
                            className={cn(
                              "mt-1 w-5 h-5 border-2 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500",
                              !task.completed && styles.text
                            )}
                          />
                          <div className="flex-1 space-y-1">
                            <label 
                              htmlFor={task.id}
                              className={cn(
                                "text-sm md:text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer block",
                                task.completed ? "text-gray-400 line-through decoration-gray-300" : "text-gray-700 dark:text-gray-200"
                              )}
                            >
                              {task.text}
                            </label>
                            {task.responsible && (
                              <p className="text-xs text-gray-500">Responsable: {task.responsible}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>

        {/* Footer / Summary */}
        {progressPercentage === 100 && (
          <Card className="bg-emerald-600 text-white border-none shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
                  <Trophy className="w-8 h-8 text-yellow-300" />
                  ¡Formación Completada!
                </h3>
                <p className="text-emerald-100 max-w-md">
                  Todas las fases de la Formación EFI 2025 han sido verificadas exitosamente.
                </p>
              </div>
              <Button variant="secondary" className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold shadow-lg">
                Generar Reporte Final <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* New Section for Catalyst Input and Send Button */}
        <Card className="border-none shadow-lg overflow-hidden bg-white dark:bg-gray-900">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-4">
              <label htmlFor="catalyst-bottom" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4" />
                Catalizador Encargado
              </label>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="catalyst-bottom"
                    placeholder="Nombre del responsable"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                    value={catalystName}
                    onChange={(e) => setCatalystName(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleSaveData}
                  disabled={isSaving || !catalystName.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100 dark:shadow-none h-12 px-8 min-w-[140px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Respuestas
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-400 text-center md:text-left">
                Al enviar, se guardará un registro permanente en el repositorio de GitHub.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
