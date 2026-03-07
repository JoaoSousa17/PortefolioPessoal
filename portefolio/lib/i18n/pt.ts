const pt = {
  nav: {
    home: "Início",
    about: "Sobre",
    projects: "Projetos",
    education: "Formação",
    skills: "Skills",
    contact: "Contacto",
    blog: "Blog",
  },

  topBanner: {
    greeting: "Olá Mundo, sou eu,",
    iAm: "Sou",
    roles: [
      { article: "um", role: "Developer" },
      { article: "um", role: "Inventor" },
      { article: "um", role: "Empreendedor" },
    ],
    quote: "Why not me?",
    quoteAuthor: "— Francis Tiafoe",
    viewProjects: "Ver Projetos",
    downloadCv: "Download CV",
  },

  about: {
    whoAmI: {
      title: "Quem sou eu?",
      text: `
      O meu nome é João {apelido}, sou estudante de Engenharia Informática na Faculdade de Engenharia da Universidade do Porto e alguém movido por curiosidade, ambição e vontade constante de criar impacto através da tecnologia. Desde cedo desenvolvi um interesse natural por compreender como as coisas funcionam — não apenas a nível técnico, mas também humano, organizacional e estratégico.

      O meu percurso nunca foi definido por uma única área. Ao longo dos anos, fui explorando diferentes domínios do conhecimento, desde as ciências exatas às humanidades, passando pela tecnologia, comunicação e empreendedorismo. Essa diversidade ajudou-me a desenvolver uma forma de pensar crítica e estruturada, mas também aberta a novas perspetivas e soluções menos óbvias.

      A tecnologia surgiu como o ponto de convergência entre lógica, criatividade e impacto real. Mais do que programar, interessa-me perceber porquê construir algo, para quem e com que propósito. Essa visão levou-me a procurar experiências fora do contexto académico tradicional, nomeadamente através da participação na European Innovation Academy, onde tive contacto direto com ambientes internacionais, equipas multidisciplinares e desafios orientados para o mundo real.

      Acredito profundamente no valor da iniciativa e da comunidade. Ao longo do meu percurso estive envolvido em projetos e iniciativas que procuraram criar valor para outros estudantes e fomentar uma mentalidade mais ativa e empreendedora dentro do meio académico, nomeadamente através de {nome do projeto/comunidade, ex.: UPSTART}. Estas experiências reforçaram a minha capacidade de liderança, comunicação e trabalho em equipa, bem como a importância de criar algo maior do que o indivíduo.

      Fora do contexto académico e tecnológico, o desporto teve um papel fundamental na minha formação pessoal. A prática de {modalidade, ex.: ténis} ensinou-me disciplina, resiliência, consistência e a importância do processo — valores que transporto diariamente para projetos, estudos e decisões profissionais. Aprendi a lidar com pressão, a definir objetivos a longo prazo e a manter foco mesmo perante obstáculos.

      Hoje, vejo-me como alguém em construção constante. Procuro desafios que me obriguem a aprender, a questionar pressupostos e a evoluir, tanto a nível técnico como pessoal. Não me identifico com percursos rígidos ou pré-definidos; acredito antes em trajetos construídos com intenção, curiosidade e capacidade de adaptação. O meu objetivo é continuar a crescer como engenheiro, criador e pessoa, contribuindo para projetos que façam sentido e deixem impacto positivo.
      `
    },
    developer: {
      title: "O que me define enquanto developer?",
      text: `
Enquanto developer, sou definido pela combinação entre rigor técnico e visão prática. Não encaro o código como um fim, mas como um meio para resolver problemas reais de forma eficiente, clara e sustentável. Dou grande importância a fundamentos sólidos, boa arquitetura, legibilidade e pensamento crítico antes da implementação.

Gosto de compreender o contexto completo: o utilizador, o problema, as limitações técnicas e os objetivos finais. Essa abordagem leva-me a tomar decisões mais conscientes e a escrever software com propósito. Valorizo trabalho em equipa, comunicação clara e feedback contínuo, tanto quanto valorizo performance ou elegância técnica.

Acima de tudo, sou um developer em constante evolução, motivado por aprender novas tecnologias, melhorar processos e criar soluções que façam sentido — tecnicamente e humanamente.
      `
    }
  },

  projects: {
    title: "Projetos Desenvolvidos",
    subtitle: "Projetos em destaque que marcam a minha jornada",
    empty: "Nenhum projeto em destaque no momento.",
    featuredBadge: "Destaque",
    viewProject: "Ver Projeto",
    viewAll: "Ver Todos os Projetos",
  },

  schools: {
    title: "Formação Académica",
    subtitle: "Instituições que moldaram o meu percurso educativo",
    empty: "Nenhuma instituição registada no momento.",
    visitWebsite: "Visitar website",
    about: "Sobre",
    learnings: "Aprendizagens",
    tapToExpand: "Toque para ver mais",
  },

  courses: {
    title: "Cursos & Certificados",
    subtitle: "Cursos e certificações que complementam a minha formação",
    noCourses: "Nenhum curso em destaque no momento.",
    viewAll: "Consultar Todos os Cursos",
    viewCertificate: "Ver Certificado",
    importance: {
      high: "Alta Relevância",
      medium: "Média Relevância",
      low: "Baixa Relevância",
    },
  },

  skills: {
    title: "Skills & Competências",
    subtitle: "Tecnologias e habilidades que domino",
    empty: "Nenhuma skill registada no momento.",
  },

  contact: {
    title: "Contacto",
    subtitle: "Vamos trabalhar juntos",

    // Form labels
    name: "Nome *",
    contact: "Contacto *",
    subject: "Assunto *",
    message: "Mensagem *",

    // Placeholders
    namePlaceholder: "O teu nome",
    contactPlaceholder: "email@exemplo.com",
    subjectPlaceholder: "Qual o motivo do contacto?",
    messagePlaceholder: "Escreve a tua mensagem aqui...",

    // Button
    send: "Enviar Mensagem",
    sending: "A enviar...",

    // Feedback messages
    successTitle: "Mensagem enviada!",
    successText: "Obrigado pelo contacto. Responderei em breve!",
    errorTitle: "Erro ao enviar",
    errorText: "Algo correu mal. Por favor tenta novamente."
    },

    techRadar: {
        title: "Tech Radar",
        subtitle: "Tecnologias que estou a aprender e a utilizar atualmente",
        empty: "Nenhuma tecnologia no radar no momento.",
        learnMore: "Saber mais",
        categories: {
            learn: "A aprender",
            using: "Em uso",
            explore: "A explorar"
        }
    },

    blog: {
        title: "Blog",
        subtitle: "Partilha de conhecimento e experiências",
        empty: "Nenhum artigo publicado no momento.",
        latest: "Último artigo",
        readMore: "Ler artigo completo",
        viewAll: "Ver Mais Artigos",
    },

    social: {
        title: "Projetos Sociais & Voluntariado",
        subtitle: "Contribuindo para causas que fazem a diferença",
        volunteer: "Voluntariado",
        noVolunteer: "Nenhum projeto de voluntariado no momento.",
        visitInstitution: "Visitar instituição",
        viewCertificate: "Ver Certificado",
        other: "Outros Projetos",
        noOther: "Nenhum projeto social disponível no momento.",
        inProgress: "Em Desenvolvimento",
        teaser: "Algo especial está a ser preparado... Fica atento!",
        inDevelopment: "Em desenvolvimento",
    },

    testimonials: {
        title: "Testemunhos",
        subtitle: "O que dizem sobre o meu trabalho",
        empty: "Nenhum testemunho disponível no momento.",
        dotLabel: "Ver testemunho",
    },

    books: {
        title: "Livros",
        subtitle: "Leituras que me inspiraram e moldaram",
        empty: "Nenhum livro em destaque no momento.",
        next: "Próximo",
        viewAll: "Consultar Todos os Livros",
    },

    languages: {
      title: "Línguas",
      subtitle: "Idiomas que domino e estou a aprender",
      empty: "Nenhuma língua registada no momento."
    },

    funfacts: {
      title: "Mini-Game Fun Facts",
      subtitle: "Descobre curiosidades de forma interativa",

      terminal: {
        title: "> Terminal Interativo - Fun Facts",
        subtitle: '> Digite "help" para ver os comandos disponíveis'
      },

      placeholder: "Digite um comando...",
      funFactPrefix: "Fun Fact:",
      commandNotFound: 'Comando "{command}" não encontrado. Digite "help" para ver os comandos disponíveis.',

      help: {
        title: "Comandos disponíveis:",
        clear: "  clear        - Limpar o terminal",
        help: "  help         - Mostrar esta ajuda"
      },

      footer: {
        help: 'Digite "help" para ajuda',
        online: "Online"
      },

      tip: {
        label: "Dica",
        text: "Este é um terminal interativo. Experimenta escrever comandos e descobrir curiosidades!"
      },

      facts: {
        hello_world: {
          fact: "O meu primeiro contacto com programação foi escrever um Hello World em Python e ficar genuinamente impressionado.",
          hint: "O clássico que todos escrevem primeiro."
        },
        bug: {
          fact: "Já perdi horas por causa de um bug que era só um ponto final em Prolog.",
          hint: "Às vezes é pequeno, mas destrói tudo."
        },
        night_mode: {
          fact: "Trabalho melhor à noite, com música e pouca distração.",
          hint: "Menos luz, mais foco."
        },
        deadline: {
          fact: "Sob pressão, fico surpreendentemente produtivo.",
          hint: "Quando o tempo começa a faltar."
        },
        learning: {
          fact: "Estou sempre a aprender algo novo — por curiosidade, não obrigação.",
          hint: "Nunca acaba."
        },
        side_project: {
          fact: "Projetos pessoais são onde mais evoluo.",
          hint: "Feitos por gosto."
        },
        easter_egg: {
          fact: "Se procuras bem, encontras sempre algo escondido.",
          hint: "Nem tudo está documentado 😉"
        },
        russia: {
          fact: "Sou apaixonado por conhecer bandeiras de todos os países do mundo.",
          hint: "Maior país do mundo."
        }
      }
    },

    footer: {
      about: {
        headline: "Developer & Innovator",
        bio: "Apaixonado por tecnologia, inovação e criação de soluções que fazem a diferença.",
        downloadCV: "Download CV"
      },
      quickLinks: {
        title: "Links Rápidos",
        about: "Sobre",
        projects: "Projetos",
        schools: "Formação",
        skills: "Skills"
      },
      moreLinks: {
        title: "Explorar",
        techRadar: "Tech Radar",
        blog: "Blog",
        testimonials: "Testemunhos",
        contact: "Contacto"
      },
      contact: {
        title: "Conecta-te"
      },
      bottom: {
        copyright: "© {year} João Sousa. Feito com",
        andCoffee: "e muito café.",
        backToTop: "Voltar ao topo"
      }
    },

    errorPage: {
      title: "Oops! Página Não Encontrada",
      labels: {
        error: "Error:",
        warning: "Warning:",
        info: "Info:"
      },
      messages: {
        error: "Esta página foi abduzida por aliens",
        warning: "Ou talvez nunca tenha existido 🤔",
        info: "Mas não te preocupes, vamos resolver isto!"
      },
      jokes: [
        "// TODO: Encontrar esta página",
        "try { findPage() } catch { return 404; }",
        "if (pageExists) { show() } else { cry() }",
        "undefined is not a function... nem esta página!",
        "Error: Cannot read property 'page' of undefined"
      ],
      suggestions: {
        text: "Enquanto eu procuro o que aconteceu, podes:",
        coffee: { title: "Beber um Café ☕", desc: "Porque debugging sem café não conta" },
        stack: { title: "Consultar Stack Overflow 📚", desc: "A solução está sempre lá!" },
        restart: { title: "Reiniciar o Computador 🔄", desc: "A solução universal para tudo" }
      },
      actions: { home: "Voltar à Homepage", back: "← Voltar Atrás" },
      easterEgg: "Erro #404 | Stack Trace: [HomePage → ???] | Sugestão: git checkout homepage",
      proTip: { label: "Pro tip:", text: "Ctrl+Z não funciona na vida real... nem aqui 😅" }
    },

    booksPage: {
      backHome: "Voltar à página inicial",
      title: "Biblioteca",
      subtitle: "Todos os livros que li e me marcaram",
      stats: {
        total: "Livros Lidos",
        featured: "Em Destaque"
      },
      noBooks: "Nenhum livro disponível no momento.",
      featuredBadge: "Destaque",
      viewOnGoogle: "Ver no Google Books"
    },

    blogPage: {
      backHome: "Voltar à página inicial",
      title: "Blog",
      subtitle: "Artigos sobre tecnologia, programação e inovação",
      stats: {
        published: "Artigos Publicados"
      },
      noPosts: "Nenhum artigo publicado no momento.",
      readMore: "Ler artigo completo",
      backToBlog: "Voltar ao blog",
      readingTime: "{minutes} min de leitura",
      share: "Partilhar",
      copiedLink: "Link copiado para a área de transferência!",
      notFound: "Artigo não encontrado",
      tags: "Tags",
      readMorePrompt: "Gostou deste artigo? Leia mais!"
    },

    coursesPage: {
      backHome: "Voltar à página inicial",
      title: "Licenças & Certificações",
      subtitle: "Todos os cursos e certificações que complementam a minha formação",

      stats: {
        total: "Total de Cursos",
        featured: "Em Destaque",
        highImportance: "Alta Relevância"
      },

      featured: "Destaque",
      viewCertificate: "Ver Certificado",
      empty: "Nenhum curso disponível no momento.",

      importance: {
        high: "Alta Relevância",
        medium: "Média Relevância",
        low: "Baixa Relevância"
      }
    },

    projectsPage: {
      back: "Voltar à página inicial",
      hero: {
        title: "Todos os Projetos",
        subtitle: "Explore todos os projetos que desenvolvi"
      },
      stats: {
        active: "Projetos Ativos",
        featured: "Em Destaque"
      },
      featured: "Destaque",
      viewDetails: "Ver Detalhes",
      demo: "Demo",
      empty: "Nenhum projeto disponível no momento."
    },

    projectDetail: {
      back: "Voltar aos projetos",
      backToProjects: "Voltar aos projetos",
      notFound: "Projeto não encontrado",
      featured: "Projeto em Destaque",
      live: "Ver Projeto Live",
      github: "Ver no GitHub",
      technologies: "Tecnologias",
      about: "Sobre o Projeto",
      cta: "Gostou deste projeto? Veja mais!",
      viewAll: "Ver Todos os Projetos"
    },

    auth: {
      title: "Acesso Admin",
      subtitle: "Área restrita • Autenticação requerida",
      back: "Voltar à página inicial",

      username: "Username",
      password: "Password",
      usernamePlaceholder: "Digite o seu username",
      passwordPlaceholder: "Digite a sua password",

      submit: "Entrar no Admin",
      loading: "A autenticar...",

      securityTitle: "Conexão segura",
      securityText: "Os seus dados são protegidos com encriptação de ponta a ponta",

      footer: "Desenvolvido com ❤️ por João Sousa",

      errors: {
        title: "Erro de autenticação",
        invalidCredentials: "Username ou password incorretos",
        generic: "Erro ao fazer login. Tenta novamente."
      }
    }
}

export default pt
