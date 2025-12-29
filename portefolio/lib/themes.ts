export type Theme = {
    id: string
    name: string
    colors: {
      background: string
      foreground: string
      primary: string
      primaryForeground: string
      secondary: string
      secondaryForeground: string
      accent: string
      accentForeground: string
      muted: string
      mutedForeground: string
      border: string
      ring: string
    }
  }
  
  export const themes: Theme[] = [
    {
      id: "default",
      name: "Default",
      colors: {
        background: "0 0% 100%",
        foreground: "222.2 84% 4.9%",
        primary: "222.2 47.4% 11.2%",
        primaryForeground: "210 40% 98%",
        secondary: "210 40% 96.1%",
        secondaryForeground: "222.2 47.4% 11.2%",
        accent: "210 40% 96.1%",
        accentForeground: "222.2 47.4% 11.2%",
        muted: "210 40% 96.1%",
        mutedForeground: "215.4 16.3% 46.9%",
        border: "214.3 31.8% 91.4%",
        ring: "222.2 84% 4.9%",
      },
    },
    {
      id: "dark",
      name: "Dark",
      colors: {
        background: "222.2 84% 4.9%",
        foreground: "210 40% 98%",
        primary: "210 40% 98%",
        primaryForeground: "222.2 47.4% 11.2%",
        secondary: "217.2 32.6% 17.5%",
        secondaryForeground: "210 40% 98%",
        accent: "217.2 32.6% 17.5%",
        accentForeground: "210 40% 98%",
        muted: "217.2 32.6% 17.5%",
        mutedForeground: "215 20.2% 65.1%",
        border: "217.2 32.6% 17.5%",
        ring: "212.7 26.8% 83.9%",
      },
    },
    {
      id: "emerald",
      name: "Emerald",
      colors: {
        background: "0 0% 100%",
        foreground: "160 84% 10%",
        primary: "160 84% 39%",
        primaryForeground: "0 0% 100%",
        secondary: "160 60% 90%",
        secondaryForeground: "160 84% 10%",
        accent: "160 100% 95%",
        accentForeground: "160 84% 20%",
        muted: "160 30% 95%",
        mutedForeground: "160 20% 40%",
        border: "160 30% 85%",
        ring: "160 84% 39%",
      },
    },
    {
      id: "rose",
      name: "Rose",
      colors: {
        background: "0 0% 100%",
        foreground: "346.8 77.2% 20%",
        primary: "346.8 77.2% 49.8%",
        primaryForeground: "0 0% 100%",
        secondary: "346.8 77.2% 90%",
        secondaryForeground: "346.8 77.2% 20%",
        accent: "346.8 100% 95%",
        accentForeground: "346.8 77.2% 30%",
        muted: "346.8 40% 95%",
        mutedForeground: "346.8 30% 40%",
        border: "346.8 40% 85%",
        ring: "346.8 77.2% 49.8%",
      },
    },
    {
      id: "slate",
      name: "Slate",
      colors: {
        background: "210 40% 98%",
        foreground: "215.4 16.3% 20%",
        primary: "215.4 16.3% 46.9%",
        primaryForeground: "0 0% 100%",
        secondary: "210 40% 90%",
        secondaryForeground: "215.4 16.3% 20%",
        accent: "210 40% 93%",
        accentForeground: "215.4 16.3% 25%",
        muted: "210 40% 95%",
        mutedForeground: "215.4 16.3% 50%",
        border: "210 40% 88%",
        ring: "215.4 16.3% 46.9%",
      },
    },
    {
      id: "amber",
      name: "Amber",
      colors: {
        background: "0 0% 100%",
        foreground: "43 96% 11%",
        primary: "43 96% 56%",
        primaryForeground: "43 96% 11%",
        secondary: "43 96% 90%",
        secondaryForeground: "43 96% 11%",
        accent: "43 100% 95%",
        accentForeground: "43 96% 20%",
        muted: "43 50% 95%",
        mutedForeground: "43 30% 40%",
        border: "43 50% 85%",
        ring: "43 96% 56%",
      },
    },
  ]