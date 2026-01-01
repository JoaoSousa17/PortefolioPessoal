"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Terminal, Sparkles } from "lucide-react"

type TerminalLine = {
  type: 'command' | 'output' | 'system'
  content: string
}

export function FunFactsSection() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'system', content: '> Terminal Interativo - Fun Facts' },
    { type: 'system', content: '> Digite "help" para ver os comandos disponíveis' },
    { type: 'system', content: '' }
  ])
  const [currentCommand, setCurrentCommand] = useState('')
  const terminalEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Só faz scroll dentro do terminal, não da página
    if (terminalEndRef.current) {
      const terminalBody = terminalEndRef.current.closest('.overflow-y-auto')
      if (terminalBody) {
        terminalBody.scrollTop = terminalBody.scrollHeight
      }
    }
  }, [lines])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentCommand.trim()) return

    // Add command to terminal
    setLines(prev => [...prev, { type: 'command', content: `$ ${currentCommand}` }])
    
    // Process command (placeholder for now)
    processCommand(currentCommand.trim())
    
    // Clear input
    setCurrentCommand('')
  }

  const processCommand = (command: string) => {
    const cmd = command.toLowerCase().trim()
    
    // Comandos disponíveis
    const commands: Record<string, { fact: string, hint: string }> = {
      'hello_world': {
        fact: 'O meu primeiro contacto com programação foi escrever um Hello World e ficar genuinamente impressionado.',
        hint: 'O clássico que todos escrevem primeiro.'
      },
      'bug': {
        fact: 'Já perdi horas por causa de um bug que era só um ponto e vírgula.',
        hint: 'Às vezes é pequeno, mas destrói tudo.'
      },
      'night_mode': {
        fact: 'Trabalho melhor à noite, com música e pouca distração.',
        hint: 'Menos luz, mais foco.'
      },
      'deadline': {
        fact: 'Sob pressão, fico surpreendentemente produtivo.',
        hint: 'Quando o tempo começa a faltar.'
      },
      'learning': {
        fact: 'Estou sempre a aprender algo novo — por curiosidade, não obrigação.',
        hint: 'Nunca acaba.'
      },
      'side_project': {
        fact: 'Projetos pessoais são onde mais evoluo.',
        hint: 'Feitos por gosto.'
      },
      'easter_egg': {
        fact: 'Se procuras bem, encontras sempre algo escondido.',
        hint: 'Nem tudo está documentado 😉'
      },
      'russia': {
        fact: 'Sou apaixonado por conhecer bandeiras de todos os países do mundo.',
        hint: 'Maior país do mundo.'
      }
    }

    let output: TerminalLine[]

    if (cmd === 'help') {
      // Mostrar lista de comandos com hints
      output = [
        { type: 'output', content: 'Comandos disponíveis:' },
        { type: 'output', content: '' },
        { type: 'output', content: '  hello_world  - O clássico que todos escrevem primeiro.' },
        { type: 'output', content: '  bug          - Às vezes é pequeno, mas destrói tudo.' },
        { type: 'output', content: '  night_mode   - Menos luz, mais foco.' },
        { type: 'output', content: '  deadline     - Quando o tempo começa a faltar.' },
        { type: 'output', content: '  learning     - Nunca acaba.' },
        { type: 'output', content: '  side_project - Feitos por gosto.' },
        { type: 'output', content: '  easter_egg   - Nem tudo está documentado 😉' },
        { type: 'output', content: '  russia       - Maior país do mundo.' },
        { type: 'output', content: '' },
        { type: 'output', content: '  clear        - Limpar o terminal' },
        { type: 'output', content: '  help         - Mostrar esta ajuda' }
      ]
    } else if (cmd === 'secret_auth') {
      // Redirecionar para página de auth
      window.location.href = '/auth'
      return
    } else if (cmd === 'error') {
      // Redirecionar para página de auth
      window.location.href = 'not-found.tsx'
      return
    }else if (cmd === 'clear') {
      // Limpar terminal
      setLines([
        { type: 'system', content: '> Terminal Interativo - Fun Facts' },
        { type: 'system', content: '> Digite "help" para ver os comandos disponíveis' },
        { type: 'system', content: '' }
      ])
      return
    } else if (commands[cmd]) {
      // Mostrar fun fact
      output = [
        { type: 'output', content: `💡 Fun Fact: ${commands[cmd].fact}` }
      ]
    } else {
      // Comando não encontrado
      output = [
        { type: 'output', content: `Comando "${command}" não encontrado. Digite "help" para ver os comandos disponíveis.` }
      ]
    }
    
    setLines(prev => [...prev, ...output, { type: 'system', content: '' }])
  }

  const handleTerminalClick = () => {
    inputRef.current?.focus()
  }

  return (
    <section className="relative w-full bg-[#E8E2E1] py-16 md:py-24 overflow-hidden">
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-slate-800/5 rounded-full blur-3xl" />
        <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-red-700/5 rounded-full blur-3xl" />
      </div>

      {/* Bottom separator */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-white via-gray-100 to-white" />

      <div className="relative container mx-auto px-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-12 animate-in fade-in slide-in-from-bottom">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-xl">
            <Terminal className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              Mini-Game Fun Facts
            </h2>
            <p className="text-slate-700 text-lg mt-2 text-justify">
              Descobre curiosidades de forma interativa
            </p>
          </div>
        </div>

        {/* Terminal Card */}
        <Card className="max-w-4xl mx-auto bg-slate-900 border-2 border-slate-700 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom" style={{ animationDelay: '100ms' }}>
          
          {/* Terminal Header */}
          <div className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Terminal className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-mono text-slate-400">terminal@funfacts:~</span>
            </div>
            <div className="ml-auto">
              <Sparkles className="w-4 h-4 text-slate-500" />
            </div>
          </div>

          {/* Terminal Body */}
          <div 
            className="bg-slate-950 p-6 min-h-[400px] max-h-[500px] overflow-y-auto font-mono text-sm cursor-text"
            onClick={handleTerminalClick}
          >
            {/* Terminal Lines */}
            {lines.map((line, index) => (
              <div key={index} className="mb-1">
                {line.type === 'command' && (
                  <div className="text-emerald-400 flex items-start gap-2">
                    <span className="text-emerald-500 font-bold select-none"></span>
                    <span>{line.content}</span>
                  </div>
                )}
                {line.type === 'output' && (
                  <div className="text-slate-300 pl-0">
                    {line.content}
                  </div>
                )}
                {line.type === 'system' && (
                  <div className="text-cyan-400">
                    {line.content}
                  </div>
                )}
              </div>
            ))}

            {/* Current Input Line */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
              <span className="text-emerald-500 font-bold select-none">$</span>
              <Input
                ref={inputRef}
                type="text"
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                className="flex-1 bg-transparent border-0 text-emerald-400 font-mono text-sm p-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-600"
                placeholder="Digite um comando..."
                autoFocus
                autoComplete="off"
                spellCheck={false}
              />
            </form>

            {/* Cursor blink effect */}
            <div ref={terminalEndRef} />
          </div>

          {/* Terminal Footer */}
          <div className="bg-slate-800 border-t border-slate-700 px-6 py-2 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">
              Digite "help" para ajuda
            </span>
            <span className="text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>

        </Card>

        {/* Instructions */}
        <div className="max-w-4xl mx-auto mt-6 text-center">
          <p className="text-slate-600 text-sm">
            💡 <span className="font-semibold">Dica:</span> Este é um terminal interativo. Experimenta escrever comandos e descobrir curiosidades!
          </p>
        </div>

      </div>
    </section>
  )
}
