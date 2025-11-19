'use client'

import { useState, useEffect } from 'react'
import { Check, Calendar, ChevronDown, ChevronUp, Trophy, ArrowRight, User, Send, Loader2, Sparkles, Flame, Award, Star, Clock, Camera, Upload, MessageSquare, AlertTriangle, ImageIcon, X, Bell, BellOff } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import confetti from 'canvas-confetti'
import { useToast } from "@/hooks/use-toast"
import { AnalyticsChart } from "@/components/analytics-chart"
import { PDFGenerator } from "@/components/pdf-generator"

// Helper function to calculate week number
function getWeekNumber(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

// Definición de tipos para las tareas y fases
type Task = {
  id: string
  text: string
  completed: boolean
  responsible?: string
  notes?: string
  photos?: string[]
  priority?: 'low' | 'medium' | 'high'
  startTime?: string
  completionTime?: string
}

type Phase = {
  id: string
  title: string
  color: 'green' | 'blue' | 'orange'
  tasks: Task[]
}

type Achievement = {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
}

type UserStats = {
  currentStreak: number
  longestStreak: number
  totalPoints: number
  weeklyCompletions: number
  lastCompletionDate?: string
  achievements: Achievement[]
  avatarUrl?: string
}

type WeeklyHistory = {
  week: number
  percentage: number
  completedTasks: number
  date: string
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

const initialAchievements: Achievement[] = [
  { id: 'first', title: 'Primera Vez', description: 'Completa tu primer checklist', icon: '🎯', unlocked: false },
  { id: 'perfectionist', title: 'Perfeccionista', description: 'Completa 5 semanas al 100%', icon: '💎', unlocked: false },
  { id: 'streak3', title: 'En Racha', description: '3 semanas consecutivas completadas', icon: '🔥', unlocked: false },
  { id: 'streak5', title: 'Imparable', description: '5 semanas consecutivas completadas', icon: '⚡', unlocked: false },
  { id: 'speedster', title: 'Velocista', description: 'Completa todo en menos de 30 minutos', icon: '🚀', unlocked: false },
  { id: 'earlybird', title: 'Madrugador', description: 'Completa antes de las 10am', icon: '🌅', unlocked: false },
]

export function ChecklistDashboard() {
  const [phases, setPhases] = useState<Phase[]>(initialPhases)
  const [expandedPhase, setExpandedPhase] = useState<string | null>('antes')
  const [catalystId, setCatalystId] = useState('')
  const [catalystName, setCatalystName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [currentWeek, setCurrentWeek] = useState(0)
  const [userStats, setUserStats] = useState<UserStats>({
    currentStreak: 0,
    longestStreak: 0,
    totalPoints: 0,
    weeklyCompletions: 0,
    achievements: initialAchievements,
  })
  const [showAchievementDialog, setShowAchievementDialog] = useState(false)
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [selectedTask, setSelectedTask] = useState<{phaseId: string, taskId: string} | null>(null)
  const [taskNote, setTaskNote] = useState('')
  const [elapsedTimes, setElapsedTimes] = useState<Record<string, number>>({})
  const { toast } = useToast()

  const [weeklyHistory, setWeeklyHistory] = useState<WeeklyHistory[]>([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [profileLoaded, setProfileLoaded] = useState(false)
  
  useEffect(() => {
    setCurrentWeek(getWeekNumber(new Date()))
    setStartTime(new Date())
  }, [])

  useEffect(() => {
    if (!catalystId.trim()) {
      setProfileLoaded(false)
      return
    }

    // Generar clave única basada en el ID del catalizador
    const profileKey = `catalyst_profile_${catalystId}`
    const statsKey = `catalyst_stats_${catalystId}`
    const historyKey = `catalyst_history_${catalystId}`
    const avatarKey = `catalyst_avatar_${catalystId}`
    const notificationsKey = `catalyst_notifications_${catalystId}`
    const nameKey = `catalyst_name_${catalystId}`
    
    const savedStats = localStorage.getItem(statsKey)
    const savedAvatar = localStorage.getItem(avatarKey)
    const savedHistory = localStorage.getItem(historyKey)
    const savedNotifications = localStorage.getItem(notificationsKey)
    const savedName = localStorage.getItem(nameKey)
    
    if (savedStats) {
      setUserStats(JSON.parse(savedStats))
    } else {
      // Resetear stats si es un nuevo perfil
      setUserStats({
        currentStreak: 0,
        longestStreak: 0,
        totalPoints: 0,
        weeklyCompletions: 0,
        achievements: initialAchievements,
      })
    }
    
    if (savedAvatar) {
      setUserStats(prev => ({ ...prev, avatarUrl: savedAvatar }))
    }
    
    if (savedHistory) {
      setWeeklyHistory(JSON.parse(savedHistory))
    } else {
      setWeeklyHistory([])
    }
    
    if (savedNotifications) {
      setNotificationsEnabled(JSON.parse(savedNotifications))
    } else {
      setNotificationsEnabled(false)
    }
    
    if (savedName) {
      setCatalystName(savedName)
    } else {
      setCatalystName('')
    }
    
    setProfileLoaded(true)
    
    toast({
      title: "Perfil cargado",
      description: `Bienvenido, catalizador ID: ${catalystId}`,
      className: "bg-emerald-600 text-white border-none"
    })
  }, [catalystId])

  useEffect(() => {
    if (!catalystId.trim() || !profileLoaded) return
    
    const statsKey = `catalyst_stats_${catalystId}`
    localStorage.setItem(statsKey, JSON.stringify(userStats))
  }, [userStats, catalystId, profileLoaded])

  useEffect(() => {
    if (!catalystId.trim() || !profileLoaded) return
    
    const avatarKey = `catalyst_avatar_${catalystId}`
    if (userStats.avatarUrl) {
      localStorage.setItem(avatarKey, userStats.avatarUrl)
    }
  }, [userStats.avatarUrl, catalystId, profileLoaded])

  useEffect(() => {
    if (!catalystId.trim() || !profileLoaded) return
    
    const historyKey = `catalyst_history_${catalystId}`
    localStorage.setItem(historyKey, JSON.stringify(weeklyHistory))
  }, [weeklyHistory, catalystId, profileLoaded])

  useEffect(() => {
    if (!catalystId.trim() || !profileLoaded) return
    
    const notificationsKey = `catalyst_notifications_${catalystId}`
    localStorage.setItem(notificationsKey, JSON.stringify(notificationsEnabled))
  }, [notificationsEnabled, catalystId, profileLoaded])

  useEffect(() => {
    if (!catalystId.trim() || !profileLoaded) return
    
    const nameKey = `catalyst_name_${catalystId}`
    if (catalystName.trim()) {
      localStorage.setItem(nameKey, catalystName)
    }
  }, [catalystName, catalystId, profileLoaded])


  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTimes(prev => {
        const updated = { ...prev }
        phases.forEach(phase => {
          phase.tasks.forEach(task => {
            if (task.startTime && !task.completed) {
              const start = new Date(task.startTime).getTime()
              const now = new Date().getTime()
              updated[task.id] = Math.floor((now - start) / 1000)
            }
          })
        })
        return updated
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [phases])

  const totalTasks = phases.reduce((acc, phase) => acc + phase.tasks.length, 0)
  const completedTasks = phases.reduce((acc, phase) => 
    acc + phase.tasks.filter(t => t.completed).length, 0
  )
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100)

  useEffect(() => {
    if (progressPercentage === 100) {
      confetti({
        particleCount: 300,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#10b981', '#0ea5e9', '#f97316'],
        scalar: 1.5,
        gravity: 0.8,
        ticks: 300
      })
      
      checkAndUnlockAchievements()
      
      const newEntry: WeeklyHistory = {
        week: currentWeek,
        percentage: progressPercentage,
        completedTasks: completedTasks,
        date: new Date().toISOString()
      }
      
      const updatedHistory = [...weeklyHistory.filter(h => h.week !== currentWeek), newEntry]
      setWeeklyHistory(updatedHistory)
      
      if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('¡Formación Completada!', {
          body: `Has completado el 100% de las tareas de la semana ${currentWeek}. ¡Excelente trabajo!`,
          icon: '/placeholder.svg?height=128&width=128',
        })
      }
    }
  }, [progressPercentage])

  const checkAndUnlockAchievements = () => {
    const now = new Date()
    const hour = now.getHours()
    const completionTime = startTime ? (now.getTime() - startTime.getTime()) / 1000 / 60 : 0
    
    let newUnlocks: Achievement[] = []
    
    setUserStats(prev => {
      const updated = { ...prev }
      
      // First completion
      if (!updated.achievements.find(a => a.id === 'first')?.unlocked) {
        const achievement = updated.achievements.find(a => a.id === 'first')
        if (achievement) {
          achievement.unlocked = true
          achievement.unlockedAt = now.toISOString()
          newUnlocks.push(achievement)
        }
      }
      
      // Early bird (before 10am)
      if (hour < 10 && !updated.achievements.find(a => a.id === 'earlybird')?.unlocked) {
        const achievement = updated.achievements.find(a => a.id === 'earlybird')
        if (achievement) {
          achievement.unlocked = true
          achievement.unlockedAt = now.toISOString()
          newUnlocks.push(achievement)
        }
      }
      
      // Speedster (less than 30 minutes)
      if (completionTime < 30 && !updated.achievements.find(a => a.id === 'speedster')?.unlocked) {
        const achievement = updated.achievements.find(a => a.id === 'speedster')
        if (achievement) {
          achievement.unlocked = true
          achievement.unlockedAt = now.toISOString()
          newUnlocks.push(achievement)
        }
      }
      
      // Update streak
      const lastDate = updated.lastCompletionDate ? new Date(updated.lastCompletionDate) : null
      const daysSinceLastCompletion = lastDate ? Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)) : 999
      
      if (daysSinceLastCompletion <= 7) {
        updated.currentStreak += 1
      } else {
        updated.currentStreak = 1
      }
      
      updated.longestStreak = Math.max(updated.longestStreak, updated.currentStreak)
      updated.lastCompletionDate = now.toISOString()
      updated.weeklyCompletions += 1
      updated.totalPoints += 100 + (updated.currentStreak * 10)
      
      // Streak achievements
      if (updated.currentStreak >= 3 && !updated.achievements.find(a => a.id === 'streak3')?.unlocked) {
        const achievement = updated.achievements.find(a => a.id === 'streak3')
        if (achievement) {
          achievement.unlocked = true
          achievement.unlockedAt = now.toISOString()
          newUnlocks.push(achievement)
        }
      }
      
      if (updated.currentStreak >= 5 && !updated.achievements.find(a => a.id === 'streak5')?.unlocked) {
        const achievement = updated.achievements.find(a => a.id === 'streak5')
        if (achievement) {
          achievement.unlocked = true
          achievement.unlockedAt = now.toISOString()
          newUnlocks.push(achievement)
        }
      }
      
      // Perfectionist (5 weeks at 100%)
      if (updated.weeklyCompletions >= 5 && !updated.achievements.find(a => a.id === 'perfectionist')?.unlocked) {
        const achievement = updated.achievements.find(a => a.id === 'perfectionist')
        if (achievement) {
          achievement.unlocked = true
          achievement.unlockedAt = now.toISOString()
          newUnlocks.push(achievement)
        }
      }
      
      return updated
    })
    
    // Show achievement dialog for new unlocks
    if (newUnlocks.length > 0) {
      setNewAchievement(newUnlocks[0])
      setShowAchievementDialog(true)
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#d97706'],
        scalar: 1.3
      })
    }
  }

  const toggleTask = (phaseId: string, taskId: string) => {
    const phase = phases.find(p => p.id === phaseId)
    const task = phase?.tasks.find(t => t.id === taskId)
    
    if (task && !task.completed) {
      setUserStats(prev => ({
        ...prev,
        totalPoints: prev.totalPoints + 10
      }))
      
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        scalar: 1.2,
        shapes: ['circle', 'square'],
        colors: ['#10b981', '#34d399', '#6ee7b7']
      })
    }

    setPhases(phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          tasks: phase.tasks.map(task => {
            if (task.id === taskId) {
              if (!task.completed) {
                return { 
                  ...task, 
                  completed: true,
                  completionTime: new Date().toISOString(),
                  startTime: task.startTime || new Date().toISOString()
                }
              } else {
                return { 
                  ...task, 
                  completed: false,
                  completionTime: undefined
                }
              }
            } else if (!task.startTime && !task.completed) {
              return {
                ...task,
                startTime: new Date().toISOString()
              }
            }
            return task
          })
        }
      }
      return phase
    }))
  }

  const togglePhase = (phaseId: string) => {
    setExpandedPhase(expandedPhase === phaseId ? null : phaseId)
  }

  const addNoteToTask = (phaseId: string, taskId: string, note: string) => {
    setPhases(phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          tasks: phase.tasks.map(task => 
            task.id === taskId ? { ...task, notes: note } : task
          )
        }
      }
      return phase
    }))
    
    toast({
      title: "Nota guardada",
      description: "La nota se ha agregado a la tarea.",
      className: "bg-emerald-600 text-white border-none"
    })
  }

  const addPhotoToTask = (phaseId: string, taskId: string, photoUrl: string) => {
    setPhases(phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          tasks: phase.tasks.map(task => {
            if (task.id === taskId) {
              return { 
                ...task, 
                photos: [...(task.photos || []), photoUrl] 
              }
            }
            return task
          })
        }
      }
      return phase
    }))
    
    toast({
      title: "Foto agregada",
      description: "La evidencia fotográfica se ha guardado.",
      className: "bg-emerald-600 text-white border-none"
    })
  }

  const removePhotoFromTask = (phaseId: string, taskId: string, photoIndex: number) => {
    setPhases(phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          tasks: phase.tasks.map(task => {
            if (task.id === taskId) {
              const newPhotos = [...(task.photos || [])]
              newPhotos.splice(photoIndex, 1)
              return { ...task, photos: newPhotos }
            }
            return task
          })
        }
      }
      return phase
    }))
  }

  const setTaskPriority = (phaseId: string, taskId: string, priority: 'low' | 'medium' | 'high') => {
    setPhases(phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          tasks: phase.tasks.map(task => 
            task.id === taskId ? { ...task, priority } : task
          )
        }
      }
      return phase
    }))
  }

  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPriorityStyles = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500 animate-pulse'
      case 'medium':
        return 'border-l-4 border-yellow-500'
      case 'low':
        return 'border-l-4 border-green-500'
      default:
        return ''
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, phaseId: string, taskId: string) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        addPhotoToTask(phaseId, taskId, reader.result as string)
      }
      reader.readAsDataURL(file)
    }
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
    if (!catalystId.trim()) {
      toast({
        title: "ID requerido",
        description: "Por favor ingrese su número de identificación antes de enviar.",
        variant: "destructive"
      })
      return
    }

    if (!catalystName.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingrese su nombre completo antes de enviar.",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)
    console.log("[v0] Starting save process...")

    try {
      const dataToSave = {
        catalystId,
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
            completed: task.completed,
            notes: task.notes,
            photos: task.photos,
            priority: task.priority,
            startTime: task.startTime,
            completionTime: task.completionTime
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
      console.log("[v0] API Response:", result)

      if (!response.ok) {
        throw new Error(result.error || 'Error al guardar los datos')
      }

      toast({
        title: "Guardado exitoso",
        description: `Los registros de ${catalystName} (ID: ${catalystId}) han sido guardados correctamente en GitHub.`,
        className: "bg-emerald-600 text-white border-none"
      })

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.7 },
        scalar: 1.4,
        colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0']
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

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const avatarUrl = reader.result as string
        setUserStats(prev => ({ ...prev, avatarUrl }))
        if (catalystId.trim() && profileLoaded) {
          const avatarKey = `catalyst_avatar_${catalystId}`
          localStorage.setItem(avatarKey, avatarUrl)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleNotifications = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "No soportado",
        description: "Tu navegador no soporta notificaciones.",
        variant: "destructive"
      })
      return
    }
    
    if (!notificationsEnabled) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setNotificationsEnabled(true)
        if (catalystId.trim() && profileLoaded) {
          const notificationsKey = `catalyst_notifications_${catalystId}`
          localStorage.setItem(notificationsKey, 'true')
        }
        toast({
          title: "Notificaciones activadas",
          description: "Recibirás notificaciones sobre tu progreso.",
          className: "bg-emerald-600 text-white border-none"
        })
      }
    } else {
      setNotificationsEnabled(false)
      if (catalystId.trim() && profileLoaded) {
        const notificationsKey = `catalyst_notifications_${catalystId}`
        localStorage.setItem(notificationsKey, 'false')
      }
      toast({
        title: "Notificaciones desactivadas",
        description: "Ya no recibirás notificaciones.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="h-16 w-auto shrink-0">
              <img 
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logocun-CLB2GsIiDjZOPFvLDglgAOPElqruTb.png" 
                alt="CUN - Corporación Unificada Nacional de Educación Superior" 
                className="h-full w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Catalizador administrativo EFI
              </h1>
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                Semana {currentWeek} • Checklist de Control
              </p>
            </div>
          </div>

          <div className="w-full md:w-64 flex flex-col gap-2">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Progreso General</span>
              <span className={cn(
                "font-bold text-xl transition-all duration-500 ease-out transform",
                progressPercentage === 100 ? "text-emerald-600 dark:text-emerald-400 scale-110" : "text-emerald-600 dark:text-emerald-400"
              )}>
                {progressPercentage}%
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={progressPercentage} 
                className={cn(
                  "h-4 transition-all duration-1000 ease-out shadow-lg",
                  progressPercentage === 100 ? "animate-pulse" : ""
                )} 
              />
              <div className={cn(
                "absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-opacity duration-500",
                progressPercentage > 0 ? "opacity-100 animate-shimmer" : "opacity-0"
              )} style={{
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s infinite'
              }} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              {completedTasks} de {totalTasks} tareas completadas
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleNotifications}
              className="mt-2"
            >
              {notificationsEnabled ? (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Notificaciones ON
                </>
              ) : (
                <>
                  <BellOff className="w-4 h-4 mr-2" />
                  Notificaciones OFF
                </>
              )}
            </Button>
          </div>
        </header>

        <Card className="bg-gradient-to-br from-emerald-50 to-sky-50 dark:from-emerald-950/30 dark:to-sky-950/30 border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar Section */}
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800 shadow-xl">
                  <AvatarImage src={userStats.avatarUrl || "/placeholder.svg"} alt={`Catalizador ${catalystId}`} />
                  <AvatarFallback className="bg-emerald-600 text-white text-2xl font-bold">
                    {catalystId.slice(0, 2).toUpperCase() || 'CA'}
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>

              {/* Stats Grid */}
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                  <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                    <Flame className="w-5 h-5" />
                    <span className="text-2xl font-bold">{userStats.currentStreak}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Racha Actual</p>
                </div>

                <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                  <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                    <Star className="w-5 h-5" />
                    <span className="text-2xl font-bold">{userStats.totalPoints}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Puntos</p>
                </div>

                <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                  <div className="flex items-center justify-center gap-1 text-purple-500 mb-1">
                    <Trophy className="w-5 h-5" />
                    <span className="text-2xl font-bold">{userStats.achievements.filter(a => a.unlocked).length}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Insignias</p>
                </div>

                <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                  <div className="flex items-center justify-center gap-1 text-emerald-500 mb-1">
                    <Award className="w-5 h-5" />
                    <span className="text-2xl font-bold">{userStats.weeklyCompletions}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Semanas</p>
                </div>
              </div>
            </div>

            {/* Achievements Preview */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Insignias Desbloqueadas</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-xs">
                      Ver todas
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Todas las Insignias</DialogTitle>
                      <DialogDescription>
                        Completa desafíos para desbloquear insignias especiales
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {userStats.achievements.map(achievement => (
                        <div
                          key={achievement.id}
                          className={cn(
                            "p-4 rounded-lg border-2 text-center transition-all",
                            achievement.unlocked
                              ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 dark:from-yellow-950/30 dark:to-orange-950/30 dark:border-yellow-700"
                              : "bg-gray-50 border-gray-200 opacity-50 dark:bg-gray-900 dark:border-gray-700"
                          )}
                        >
                          <div className="text-4xl mb-2">{achievement.icon}</div>
                          <h4 className="font-semibold text-sm mb-1">{achievement.title}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{achievement.description}</p>
                          {achievement.unlocked && achievement.unlockedAt && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                              {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {userStats.achievements.filter(a => a.unlocked).map(achievement => (
                  <div
                    key={achievement.id}
                    className={cn(
                      "flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 flex items-center justify-center text-3xl border-2 border-yellow-300 dark:border-yellow-700 shadow-sm"
                    )}
                    title={achievement.title}
                  >
                    {achievement.icon}
                  </div>
                ))}
                {userStats.achievements.filter(a => a.unlocked).length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    Completa tu primer checklist para desbloquear insignias
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showAchievementDialog} onOpenChange={setShowAchievementDialog}>
          <DialogContent className="max-w-md">
            <div className="text-center py-6">
              <div className="text-7xl mb-4 animate-bounce">{newAchievement?.icon}</div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                ¡Insignia Desbloqueada!
              </h2>
              <h3 className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                {newAchievement?.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {newAchievement?.description}
              </p>
              <Button onClick={() => setShowAchievementDialog(false)} className="bg-emerald-600 hover:bg-emerald-700">
                ¡Genial!
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {weeklyHistory.length > 0 && (
          <AnalyticsChart weeklyData={weeklyHistory} />
        )}

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
                            "group flex items-start gap-4 p-4 md:p-5 transition-all duration-500 ease-out relative overflow-hidden",
                            task.completed 
                              ? "bg-gray-50/80 dark:bg-gray-900/50" 
                              : "hover:bg-gray-50 dark:hover:bg-gray-800/30",
                            getPriorityStyles(task.priority)
                          )}
                        >
                          {/* Background highlight effect on completion */}
                          <div className={cn(
                            "absolute inset-0 opacity-0 transition-opacity duration-700 pointer-events-none",
                            task.completed ? "opacity-100" : "",
                            phase.color === 'green' ? "bg-gradient-to-r from-emerald-50/50 to-transparent" :
                            phase.color === 'blue' ? "bg-gradient-to-r from-sky-50/50 to-transparent" :
                            "bg-gradient-to-r from-orange-50/50 to-transparent"
                          )} />

                          <div className={cn(
                            "mt-1 relative transition-transform duration-300",
                            task.completed ? "scale-110" : "group-hover:scale-110"
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleTask(phase.id, task.id)
                          }}
                          >
                            <Checkbox 
                              id={task.id}
                              checked={task.completed}
                              className={cn(
                                "w-5 h-5 border-2 transition-all duration-300 data-[state=checked]:scale-105",
                                task.completed 
                                  ? "data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 shadow-sm shadow-emerald-200" 
                                  : styles.text
                              )}
                            />
                          </div>
                          
                          <div className="flex-1 space-y-2 relative z-10">
                            <label 
                              htmlFor={task.id}
                              className={cn(
                                "text-sm md:text-base font-medium leading-relaxed block transition-all duration-500 cursor-pointer",
                                task.completed 
                                  ? "text-gray-400 line-through decoration-emerald-500/30 decoration-2" 
                                  : "text-gray-700 dark:text-gray-200"
                              )}
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleTask(phase.id, task.id)
                              }}
                            >
                              {task.text}
                            </label>
                            
                            <div className="flex flex-wrap items-center gap-2">
                              {task.priority && (
                                <Badge variant="outline" className={cn(
                                  "text-xs",
                                  task.priority === 'high' ? "border-red-500 text-red-700 dark:text-red-400" :
                                  task.priority === 'medium' ? "border-yellow-500 text-yellow-700 dark:text-yellow-400" :
                                  "border-green-500 text-green-700 dark:text-green-400"
                                )}>
                                  {task.priority === 'high' && <AlertTriangle className="w-3 h-3 mr-1" />}
                                  {task.priority === 'high' ? 'Alta Prioridad' : task.priority === 'medium' ? 'Media' : 'Baja'}
                                </Badge>
                              )}
                              
                              {task.startTime && !task.completed && (
                                <Badge variant="outline" className="text-xs border-blue-500 text-blue-700 dark:text-blue-400">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatElapsedTime(elapsedTimes[task.id] || 0)}
                                </Badge>
                              )}
                              
                              {task.completionTime && (
                                <Badge variant="outline" className="text-xs border-emerald-500 text-emerald-700 dark:text-emerald-400">
                                  <Check className="w-3 h-3 mr-1" />
                                  Completado
                                </Badge>
                              )}
                              
                              {task.notes && (
                                <Badge variant="outline" className="text-xs">
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                  Nota
                                </Badge>
                              )}
                              
                              {task.photos && task.photos.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  <ImageIcon className="w-3 h-3 mr-1" />
                                  {task.photos.length} foto{task.photos.length > 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>

                            <div className="flex gap-2 mt-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedTask({phaseId: phase.id, taskId: task.id})
                                      setTaskNote(task.notes || '')
                                    }}
                                  >
                                    <MessageSquare className="w-3 h-3 mr-1" />
                                    {task.notes ? 'Ver nota' : 'Agregar nota'}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent onClick={(e) => e.stopPropagation()}>
                                  <DialogHeader>
                                    <DialogTitle>Notas de la tarea</DialogTitle>
                                    <DialogDescription>
                                      Agrega observaciones o comentarios sobre esta tarea
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 mt-4">
                                    <Textarea
                                      placeholder="Escribe tus observaciones aquí..."
                                      value={taskNote}
                                      onChange={(e) => setTaskNote(e.target.value)}
                                      rows={5}
                                      className="resize-none"
                                    />
                                    <div className="flex gap-2 justify-end">
                                      <Button
                                        onClick={() => {
                                          if (selectedTask) {
                                            addNoteToTask(selectedTask.phaseId, selectedTask.taskId, taskNote)
                                          }
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                      >
                                        Guardar nota
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 text-xs"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Camera className="w-3 h-3 mr-1" />
                                    {task.photos && task.photos.length > 0 ? 'Ver fotos' : 'Agregar foto'}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent onClick={(e) => e.stopPropagation()}>
                                  <DialogHeader>
                                    <DialogTitle>Evidencia fotográfica</DialogTitle>
                                    <DialogDescription>
                                      Sube fotos como evidencia de la tarea completada
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 mt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      {task.photos?.map((photo, index) => (
                                        <div key={index} className="relative group">
                                          <img 
                                            src={photo || "/placeholder.svg"} 
                                            alt={`Evidencia ${index + 1}`} 
                                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                                          />
                                          <button
                                            onClick={() => removePhotoFromTask(phase.id, task.id, index)}
                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                    <div>
                                      <label htmlFor={`photo-${task.id}`} className="cursor-pointer">
                                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:border-emerald-500 transition-colors">
                                          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                          <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Click para subir una foto
                                          </p>
                                        </div>
                                      </label>
                                      <input
                                        id={`photo-${task.id}`}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handlePhotoUpload(e, phase.id, task.id)}
                                      />
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <select
                                value={task.priority || ''}
                                onChange={(e) => {
                                  e.stopPropagation()
                                  setTaskPriority(phase.id, task.id, e.target.value as any)
                                }}
                                className="h-8 text-xs border border-gray-200 dark:border-gray-700 rounded-md px-2 bg-white dark:bg-gray-800"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <option value="">Sin prioridad</option>
                                <option value="low">Baja</option>
                                <option value="medium">Media</option>
                                <option value="high">Alta</option>
                              </select>
                            </div>
                          </div>

                          {/* Success Icon Animation */}
                          <div className={cn(
                            "absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-500 transform",
                            task.completed ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-4 scale-50"
                          )}>
                            <Sparkles className={cn(
                              "w-5 h-5", 
                              phase.color === 'green' ? "text-emerald-400" :
                              phase.color === 'blue' ? "text-sky-400" : "text-orange-400"
                            )} />
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
                  Todas las fases del Catalizador administrativo EFI han sido verificadas exitosamente.
                </p>
              </div>
              <PDFGenerator 
                data={{
                  catalystName: catalystId, // Use catalystId for name in PDF
                  date: new Date().toISOString(),
                  week: currentWeek,
                  progressPercentage,
                  completedTasks,
                  totalTasks,
                  phases: phases.map(phase => ({
                    id: phase.id,
                    title: phase.title,
                    tasks: phase.tasks
                  })),
                  stats: {
                    currentStreak: userStats.currentStreak,
                    totalPoints: userStats.totalPoints,
                    weeklyCompletions: userStats.weeklyCompletions
                  }
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* New Section for Catalyst Input and Send Button */}
        <Card className="border-none shadow-lg overflow-hidden bg-white dark:bg-gray-900">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="catalyst-id" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Número de Identificación del Catalizador
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="catalyst-id"
                    placeholder="Ingrese su número de identificación"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                    value={catalystId}
                    onChange={(e) => setCatalystId(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="catalyst-name" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nombre Completo del Catalizador
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="catalyst-name"
                    placeholder="Ingrese su nombre completo"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                    value={catalystName}
                    onChange={(e) => setCatalystName(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveData}
                disabled={isSaving || !catalystId.trim() || !catalystName.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100 dark:shadow-none h-12 px-8 w-full md:w-auto md:self-end"
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

              <p className="text-xs text-gray-400 text-center md:text-left">
                Su progreso, rachas e insignias se guardarán automáticamente bajo su número de identificación.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  )
}
