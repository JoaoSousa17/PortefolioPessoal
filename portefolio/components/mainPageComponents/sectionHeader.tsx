import { LucideIcon } from "lucide-react"

interface SectionHeaderProps {
  icon: LucideIcon
  title: string
  subtitle: string
  isRed?: boolean
}

export function SectionHeader({ icon: Icon, title, subtitle, isRed = false }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-10 md:mb-12 animate-in fade-in slide-in-from-bottom">
      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl ${
        isRed 
          ? 'bg-gradient-to-br from-red-600 to-red-700' 
          : 'bg-gradient-to-br from-slate-700 to-slate-800'
      } flex items-center justify-center shadow-lg sm:shadow-xl`}>
        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
      </div>
      <div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900">
          {title}
        </h2>
        <p className="text-slate-700 text-base sm:text-lg mt-1 sm:mt-2 text-justify">
          {subtitle}
        </p>
      </div>
    </div>
  )
}