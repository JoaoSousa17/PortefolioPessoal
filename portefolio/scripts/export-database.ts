// =====================================================
// SUPABASE DATABASE EXPORT SCRIPT
// =====================================================
// Extrai todos os dados da base de dados e imprime
// de forma bonita e organizada na consola
// =====================================================

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { writeFileSync } from 'fs'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Carregar variáveis de ambiente
dotenv.config({ path: resolve(__dirname, '../.env.local') })

// Configurar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas!')
  console.error('Certifique-se que .env.local contém:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY (ou NEXT_PUBLIC_SUPABASE_ANON_KEY)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// =====================================================
// CORES PARA TERMINAL
// =====================================================
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Cores de texto
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  // Cores de fundo
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
}

// =====================================================
// FUNÇÕES DE FORMATAÇÃO
// =====================================================

function printHeader(text: string) {
  const line = '═'.repeat(60)
  console.log(`\n${colors.bright}${colors.cyan}${line}${colors.reset}`)
  console.log(`${colors.bright}${colors.cyan}  ${text}${colors.reset}`)
  console.log(`${colors.bright}${colors.cyan}${line}${colors.reset}\n`)
}

function printSubheader(text: string, count?: number) {
  const countText = count !== undefined ? ` (${count} registro${count !== 1 ? 's' : ''})` : ''
  console.log(`${colors.bright}${colors.yellow}▶ ${text}${countText}${colors.reset}`)
  console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}`)
}

function printSuccess(text: string) {
  console.log(`${colors.green}✓${colors.reset} ${text}`)
}

function printError(text: string) {
  console.log(`${colors.red}✗${colors.reset} ${text}`)
}

function printWarning(text: string) {
  console.log(`${colors.yellow}⚠${colors.reset} ${text}`)
}

function printInfo(text: string) {
  console.log(`${colors.blue}ℹ${colors.reset} ${text}`)
}

function formatValue(value: any): string {
  if (value === null) return `${colors.dim}null${colors.reset}`
  if (value === undefined) return `${colors.dim}undefined${colors.reset}`
  if (typeof value === 'boolean') return value ? `${colors.green}true${colors.reset}` : `${colors.red}false${colors.reset}`
  if (typeof value === 'number') return `${colors.cyan}${value}${colors.reset}`
  if (typeof value === 'string') {
    if (value.length > 100) return `${colors.white}"${value.substring(0, 97)}..."${colors.reset}`
    return `${colors.white}"${value}"${colors.reset}`
  }
  if (Array.isArray(value)) return `${colors.magenta}[${value.length} items]${colors.reset}`
  if (typeof value === 'object') return `${colors.magenta}{object}${colors.reset}`
  return String(value)
}

function printTable(data: any[], maxRows: number = 50) {
  if (!data || data.length === 0) {
    printWarning('Sem dados para mostrar')
    return
  }

  // Limitar número de linhas
  const displayData = data.slice(0, maxRows)
  const hasMore = data.length > maxRows

  // Obter todas as colunas
  const allKeys = new Set<string>()
  displayData.forEach(item => Object.keys(item).forEach(key => allKeys.add(key)))
  const keys = Array.from(allKeys)

  // Calcular larguras das colunas
  const columnWidths: { [key: string]: number } = {}
  keys.forEach(key => {
    columnWidths[key] = Math.max(
      key.length,
      ...displayData.map(item => String(item[key] || '').length)
    )
    // Limitar largura máxima
    columnWidths[key] = Math.min(columnWidths[key], 50)
  })

  // Imprimir cabeçalho
  console.log()
  const header = keys.map(key => 
    `${colors.bright}${colors.cyan}${key.padEnd(columnWidths[key])}${colors.reset}`
  ).join('  ')
  console.log(header)
  console.log(`${colors.dim}${keys.map(key => '─'.repeat(columnWidths[key])).join('  ')}${colors.reset}`)

  // Imprimir linhas
  displayData.forEach((item, index) => {
    const row = keys.map(key => {
      let value = String(item[key] !== undefined && item[key] !== null ? item[key] : '')
      if (value.length > columnWidths[key]) {
        value = value.substring(0, columnWidths[key] - 3) + '...'
      }
      return value.padEnd(columnWidths[key])
    }).join('  ')
    
    // Alternar cores das linhas
    if (index % 2 === 0) {
      console.log(`${colors.dim}${row}${colors.reset}`)
    } else {
      console.log(row)
    }
  })

  if (hasMore) {
    console.log(`${colors.yellow}\n... e mais ${data.length - maxRows} registros${colors.reset}`)
  }

  console.log()
}

function printJSON(data: any, indent: number = 0) {
  const spaces = '  '.repeat(indent)
  
  if (Array.isArray(data)) {
    if (data.length === 0) {
      console.log(`${spaces}${colors.dim}[]${colors.reset}`)
      return
    }
    console.log(`${spaces}${colors.magenta}[${colors.reset}`)
    data.forEach((item, index) => {
      printJSON(item, indent + 1)
      if (index < data.length - 1) console.log(`${spaces}  ${colors.dim},${colors.reset}`)
    })
    console.log(`${spaces}${colors.magenta}]${colors.reset}`)
  } else if (typeof data === 'object' && data !== null) {
    const entries = Object.entries(data)
    if (entries.length === 0) {
      console.log(`${spaces}${colors.dim}{}${colors.reset}`)
      return
    }
    console.log(`${spaces}${colors.magenta}{${colors.reset}`)
    entries.forEach(([key, value], index) => {
      console.log(`${spaces}  ${colors.cyan}${key}${colors.reset}: ${formatValue(value)}${index < entries.length - 1 ? ',' : ''}`)
    })
    console.log(`${spaces}${colors.magenta}}${colors.reset}`)
  } else {
    console.log(`${spaces}${formatValue(data)}`)
  }
}

// =====================================================
// LISTA DE TABELAS
// =====================================================

const TABLES = [
  // Core tables
  { name: 'admin_users', icon: '👤', color: colors.red },
  { name: 'projects', icon: '🚀', color: colors.blue },
  { name: 'project_tags', icon: '🏷️', color: colors.cyan },
  
  // Blog
  { name: 'blog_posts', icon: '📝', color: colors.green },
  { name: 'blog_tags', icon: '🏷️', color: colors.cyan },
  
  // Education & Skills
  { name: 'schools', icon: '🎓', color: colors.magenta },
  { name: 'courses', icon: '📚', color: colors.yellow },
  { name: 'skills', icon: '⚡', color: colors.blue },
  { name: 'skill_categories', icon: '📂', color: colors.cyan },
  
  // Tech & Books
  { name: 'tech_radar', icon: '📡', color: colors.red },
  { name: 'books', icon: '📖', color: colors.yellow },
  
  // Social & Languages
  { name: 'languages', icon: '🌍', color: colors.green },
  { name: 'social_projects', icon: '🤝', color: colors.magenta },
  { name: 'social_project_volunteers', icon: '👥', color: colors.cyan },
  
  // Other
  { name: 'testimonials', icon: '💬', color: colors.yellow },
  { name: 'contact_messages', icon: '📧', color: colors.blue },
  
  // Bots (if exists)
  { name: 'keepalive_bots', icon: '🤖', color: colors.magenta },
  { name: 'bot_execution_logs', icon: '📊', color: colors.cyan },
]

// =====================================================
// FUNÇÃO PRINCIPAL
// =====================================================

async function exportDatabase() {
  printHeader('📦 SUPABASE DATABASE EXPORT')
  
  printInfo(`URL: ${supabaseUrl}`)
  printInfo(`Usando: ${supabaseKey.includes('service_role') ? 'Service Role Key' : 'Anon Key'}`)
  
  const results: { [key: string]: any[] } = {}
  const stats = {
    total: 0,
    success: 0,
    empty: 0,
    error: 0
  }

  // Exportar cada tabela
  for (const table of TABLES) {
    try {
      const { data, error } = await supabase
        .from(table.name)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        // Tabela não existe ou sem permissão
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          printWarning(`Tabela "${table.name}" não encontrada - ignorando`)
          stats.empty++
        } else {
          printError(`Erro ao buscar "${table.name}": ${error.message}`)
          stats.error++
        }
        continue
      }

      results[table.name] = data || []
      stats.total += data?.length || 0
      stats.success++

      // Imprimir tabela
      printSubheader(`${table.icon} ${table.name}`, data?.length || 0)
      
      if (data && data.length > 0) {
        printTable(data, 10) // Mostrar apenas 10 linhas por tabela
      } else {
        printWarning('Tabela vazia')
        stats.empty++
      }

    } catch (error: any) {
      printError(`Erro fatal ao buscar "${table.name}": ${error.message}`)
      stats.error++
    }
  }

  // =====================================================
  // RESUMO FINAL
  // =====================================================

  printHeader('📊 RESUMO DA EXPORTAÇÃO')
  
  console.log(`${colors.bright}Total de Registros:${colors.reset} ${colors.cyan}${stats.total}${colors.reset}`)
  console.log(`${colors.bright}Tabelas com Sucesso:${colors.reset} ${colors.green}${stats.success}${colors.reset}`)
  console.log(`${colors.bright}Tabelas Vazias:${colors.reset} ${colors.yellow}${stats.empty}${colors.reset}`)
  console.log(`${colors.bright}Erros:${colors.reset} ${colors.red}${stats.error}${colors.reset}`)
  
  console.log(`\n${colors.dim}${'─'.repeat(60)}${colors.reset}`)
  console.log(`${colors.bright}Tabelas por Registros:${colors.reset}\n`)
  
  // Ordenar tabelas por número de registros
  const sortedTables = Object.entries(results)
    .sort(([, a], [, b]) => b.length - a.length)
    .filter(([, data]) => data.length > 0)

  sortedTables.forEach(([tableName, data]) => {
    const table = TABLES.find(t => t.name === tableName)
    const bar = '█'.repeat(Math.ceil(data.length / 2))
    console.log(`${table?.icon || '📄'} ${colors.cyan}${tableName.padEnd(30)}${colors.reset} ${colors.green}${bar}${colors.reset} ${colors.bright}${data.length}${colors.reset}`)
  })

  // =====================================================
  // EXPORT OPCIONAL PARA JSON
  // =====================================================

  console.log(`\n${colors.dim}${'─'.repeat(60)}${colors.reset}`)
  console.log(`\n${colors.bright}${colors.yellow}💾 Exportar para JSON?${colors.reset}`)
  console.log(`Execute: ${colors.cyan}npm run db:export:json${colors.reset}`)
  console.log(`Ou: ${colors.cyan}ts-node scripts/export-database.ts --json output.json${colors.reset}\n`)

  return results
}

// =====================================================
// EXECUTAR (ES Module style)
// =====================================================

const args = process.argv.slice(2)
const exportToJson = args.includes('--json')
const outputFile = args.find(arg => arg.endsWith('.json')) || 'database-export.json'

exportDatabase()
  .then(async (results) => {
    if (exportToJson) {
      writeFileSync(outputFile, JSON.stringify(results, null, 2))
      printSuccess(`Dados exportados para: ${outputFile}`)
    }
    
    printSuccess('Exportação concluída!')
    process.exit(0)
  })
  .catch((error) => {
    console.error(`\n${colors.red}${colors.bright}💥 ERRO FATAL:${colors.reset}`)
    console.error(error)
    process.exit(1)
  })

export { exportDatabase }