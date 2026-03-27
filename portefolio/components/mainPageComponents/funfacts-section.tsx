"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Terminal, Sparkles } from "lucide-react"
import { useTranslation } from "@/lib/hooks/useTranslation"

type TerminalLine = {
  type: "command" | "output" | "system"
  content: string
}

export function FunFactsSection() {
  const { t } = useTranslation()

  const [currentCommand, setCurrentCommand] = useState("")
  const terminalEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [lines, setLines] = useState<TerminalLine[]>([])

  useEffect(() => {
    setLines([
      { type: "system", content: t.funfacts.terminal.title },
      { type: "system", content: t.funfacts.terminal.subtitle },
      { type: "system", content: "" }
    ])
  }, [t])

  useEffect(() => {
    if (terminalEndRef.current) {
      const terminalBody = terminalEndRef.current.closest(".overflow-y-auto")
      if (terminalBody) {
        terminalBody.scrollTop = terminalBody.scrollHeight
      }
    }
  }, [lines])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentCommand.trim()) return

    setLines(prev => [...prev, { type: "command", content: `$ ${currentCommand}` }])
    processCommand(currentCommand.trim())
    setCurrentCommand("")
  }

  const processCommand = (command: string) => {
    const cmd = command.toLowerCase().trim()

    const commands: Record<string, { fact: string; hint: string }> = {
      hello_world: {
        fact: t.funfacts.facts.hello_world.fact,
        hint: t.funfacts.facts.hello_world.hint
      },
      bug: {
        fact: t.funfacts.facts.bug.fact,
        hint: t.funfacts.facts.bug.hint
      },
      night_mode: {
        fact: t.funfacts.facts.night_mode.fact,
        hint: t.funfacts.facts.night_mode.hint
      },
      deadline: {
        fact: t.funfacts.facts.deadline.fact,
        hint: t.funfacts.facts.deadline.hint
      },
      learning: {
        fact: t.funfacts.facts.learning.fact,
        hint: t.funfacts.facts.learning.hint
      },
      side_project: {
        fact: t.funfacts.facts.side_project.fact,
        hint: t.funfacts.facts.side_project.hint
      },
      easter_egg: {
        fact: t.funfacts.facts.easter_egg.fact,
        hint: t.funfacts.facts.easter_egg.hint
      },
      russia: {
        fact: t.funfacts.facts.russia.fact,
        hint: t.funfacts.facts.russia.hint
      }
    }

    let output: TerminalLine[]

    if (cmd === "help") {
      // Only hints, no command names
      output = [
        { type: "output", content: t.funfacts.help.title },
        { type: "output", content: "" },
        ...Object.values(commands).map(
          (value): TerminalLine => ({
            type: "output",
            content: `  › ${value.hint}`
          })
        ),
        { type: "output", content: "" },
        { type: "output", content: t.funfacts.help.clear },
        { type: "output", content: t.funfacts.help.help },
        { type: "output", content: t.funfacts.help.helpWithAnswers }
      ]
    } else if (cmd === "help_w_answers") {
      // [command] - hint format
      output = [
        { type: "output", content: t.funfacts.help.title },
        { type: "output", content: "" },
        ...Object.entries(commands).map(
          ([key, value]): TerminalLine => ({
            type: "output",
            content: `  › [${key}] - ${value.hint}`
          })
        ),
        { type: "output", content: "" },
        { type: "output", content: t.funfacts.help.clear },
        { type: "output", content: t.funfacts.help.help },
        { type: "output", content: t.funfacts.help.helpWithAnswers }
      ]
    } else if (cmd === "secret_auth") {
      window.location.href = "/auth"
      return
    } else if (cmd === "error") {
      window.location.href = "not-found.tsx"
      return
    } else if (cmd === "clear") {
      setLines([
        { type: "system", content: t.funfacts.terminal.title },
        { type: "system", content: t.funfacts.terminal.subtitle },
        { type: "system", content: "" }
      ])
      return
    } else if (commands[cmd]) {
      output = [
        {
          type: "output",
          content: `💡 ${t.funfacts.funFactPrefix} ${commands[cmd].fact}`
        }
      ]
    } else {
      output = [
        {
          type: "output",
          content: t.funfacts.commandNotFound.replace("{command}", command)
        }
      ]
    }

    setLines(prev => [...prev, ...output, { type: "system", content: "" }])
  }

  const handleTerminalClick = () => {
    inputRef.current?.focus()
  }

  return (
    <section className="relative w-full bg-[#E8E2E1] py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-slate-800/5 rounded-full blur-3xl" />
        <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-red-700/5 rounded-full blur-3xl" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-white via-gray-100 to-white" />

      <div className="relative container mx-auto px-6">
        <div className="flex items-center gap-4 mb-12 animate-in fade-in slide-in-from-bottom">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-xl">
            <Terminal className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              {t.funfacts.title}
            </h2>
            <p className="text-slate-700 text-lg mt-2 text-justify">
              {t.funfacts.subtitle}
            </p>
          </div>
        </div>

        <Card className="max-w-4xl mx-auto bg-slate-900 border-2 border-slate-700 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom">
          <div className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Terminal className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-mono text-slate-400">
                terminal@funfacts:~
              </span>
            </div>
            <div className="ml-auto">
              <Sparkles className="w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div
            className="bg-slate-950 p-6 min-h-[400px] max-h-[500px] overflow-y-auto font-mono text-sm cursor-text"
            onClick={handleTerminalClick}
          >
            {lines.map((line, index) => (
              <div key={index} className="mb-1">
                {line.type === "command" && (
                  <div className="text-emerald-400">{line.content}</div>
                )}
                {line.type === "output" && (
                  <div className="text-slate-300">{line.content}</div>
                )}
                {line.type === "system" && (
                  <div className="text-cyan-400">{line.content}</div>
                )}
              </div>
            ))}

            <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
              <span className="text-emerald-500 font-bold">$</span>
              <Input
                ref={inputRef}
                value={currentCommand}
                onChange={e => setCurrentCommand(e.target.value)}
                className="flex-1 bg-transparent border-0 text-emerald-400 font-mono p-0 focus-visible:ring-0"
                placeholder={t.funfacts.placeholder}
              />
            </form>

            <div ref={terminalEndRef} />
          </div>

          <div className="bg-slate-800 border-t border-slate-700 px-6 py-2 flex justify-between text-xs font-mono">
            <span className="text-slate-500">{t.funfacts.footer.help}</span>
            <span className="text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {t.funfacts.footer.online}
            </span>
          </div>
        </Card>

        <div className="max-w-4xl mx-auto mt-6 text-center">
          <p className="text-slate-600 text-sm">
            💡 <span className="font-semibold">{t.funfacts.tip.label}:</span>{" "}
            {t.funfacts.tip.text}
          </p>
        </div>
      </div>
    </section>
  )
}
