export type Style = {
    id: string
    name: string
    fontClass: string
    description?: string
    letterSpacing: string
    lineHeight: string
  }
  
  export const styles: Style[] = [
    {
      id: "modern",
      name: "Moderno",
      fontClass: "font-sans",
      description: "Clean and contemporary",
      letterSpacing: "normal",
      lineHeight: "1.6",
    },
    {
      id: "elegant",
      name: "Elegante",
      fontClass: "font-serif",
      description: "Classic and sophisticated",
      letterSpacing: "0.01em",
      lineHeight: "1.7",
    },
    {
      id: "tech",
      name: "Tech",
      fontClass: "font-mono",
      description: "Developer-focused monospace",
      letterSpacing: "-0.02em",
      lineHeight: "1.5",
    },
    {
      id: "rounded",
      name: "Rounded",
      fontClass: "font-sans",
      description: "Friendly and approachable",
      letterSpacing: "0.025em",
      lineHeight: "1.65",
    },
  ]