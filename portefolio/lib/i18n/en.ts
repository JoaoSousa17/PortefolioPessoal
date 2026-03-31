const en = {
  nav: {
    home: "Home",
    about: "About",
    projects: "Projects",
    education: "Education",
    skills: "Skills",
    contact: "Contact",
    blog: "Blog",
  },

  topBanner: {
    greeting: "Hello World, it's me,",
    iAm: "I am",
    roles: [
      { article: "a", role: "Developer" },
      { article: "an", role: "Inventor" },
      { article: "an", role: "Entrepreneur" },
    ],
    quote: "Why not me?",
    quoteAuthor: "— Francis Tiafoe",
    viewProjects: "Ver Projetos",
    downloadCv: "Download CV",
  },

  about: {
    whoAmI: {
      title: "Who am I?",
      text: `
Hi, my name is João, and I am a startup enthusiast, studying Computer Science at FEUP and passionate about gym, tech, and business. Since I was a kid, I always said that my dream was to become an entrepreneur even though I didn't know which area I would want to work in or the obstacles I would have to face on this enriching journey.

Everything started for me with my participation in the European Innovation Academy. It was definitely a pivotal gateway into the entrepreneurial environment. Shortly after, together with other program participants, we founded UPSTART, a student community, with the mission of sowing entrepreneurship in the academic ecosystem, proving to students the existence of more than one possible path.

Since I was young, I have always been very interested in various topics, having studied many different areas, from languages to various sciences.

Where does the phrase with which I start this summary come from? From a young age, I developed a deep connection with sports. This particular phrase was ingrained in me during my time as a tennis player, and I carry it with me as inspiration for navigating through challenges and projects that come my way.
      `
    },
    developer: {
      title: "What defines me as a developer?",
      text: `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
      `
    }
  },

  projects: {
    title: "Developed Projects",
    subtitle: "Featured projects that mark my journey",
    empty: "No featured projects at the moment.",
    featuredBadge: "Featured",
    viewProject: "View Project",
    viewAll: "View All Projects",
  },

  schools: {
    title: "Academic Background",
    subtitle: "Institutions that shaped my educational journey",
    empty: "No institutions registered at the moment.",
    visitWebsite: "Visit website",
    about: "About",
    learnings: "Learnings",
    tapToExpand: "Tap to see more",
  },

  courses: {
    title: "Licenses & Certifications",
    subtitle: "Courses and certifications that complement my education",
    noCourses: "No featured courses at the moment.",
    viewAll: "View All Courses",
    viewCertificate: "View Certificate",
    importance: {
      high: "High Importance",
      medium: "Medium Importance",
      low: "Low Importance",
    },
  },

  skills: {
    title: "Skills & Competencies",
    subtitle: "Technologies and skills I master",
    empty: "No skills registered at the moment.",
  },

  contact: {
    title: "Contact",
    subtitle: "Let's work together",

    // Form labels
    name: "Name *",
    contact: "Contact *",
    subject: "Subject *",
    message: "Message *",

    // Placeholders
    namePlaceholder: "Your name",
    contactPlaceholder: "email@example.com",
    subjectPlaceholder: "What is this about?",
    messagePlaceholder: "Write your message here...",

    // Button
    send: "Send Message",
    sending: "Sending...",

    // Feedback messages
    successTitle: "Message sent!",
    successText: "Thank you for reaching out. I'll get back to you soon!",
    errorTitle: "Error sending message",
    errorText: "Something went wrong. Please try again."
    },

    techRadar: {
        title: "Tech Radar",
        subtitle: "Technologies I am currently learning and using",
        empty: "No technologies in the radar at the moment.",
        learnMore: "Learn more",
        categories: {
            learn: "Learning",
            using: "Using",
            explore: "Exploring"
        }
    },

    blog: {
        title: "Blog",
        subtitle: "Sharing knowledge and experiences",
        empty: "No articles published at the moment.",
        latest: "Latest article",
        readMore: "Read full article",
        viewAll: "View More Articles",
    },

    social: {
        title: "Social Projects & Volunteering",
        subtitle: "Contributing to causes that make a difference",
        volunteer: "Volunteering",
        noVolunteer: "No volunteering projects at the moment.",
        visitInstitution: "Visit institution",
        viewCertificate: "View Certificate",
        other: "Other Projects",
        noOther: "No social projects available at the moment.",
        inProgress: "In Development",
        teaser: "Something special is being prepared... Stay tuned!",
        inDevelopment: "In Development",
    },

    testimonials: {
        title: "Testimonials",
        subtitle: "What people say about my work",
        empty: "No testimonials available at the moment.",
        dotLabel: "View testimonial",
    },

    books: {
        title: "Books",
        subtitle: "Readings that inspired and shaped me",
        empty: "No featured books at the moment.",
        next: "Next",
        viewAll: "View All Books",
    },

    languages: {
      title: "Languages",
      subtitle: "Languages I master and am learning",
      empty: "No languages registered at the moment."
    },

    // en — bloco funfacts (substitui o existente)
    funfacts: {
      title: "Mini-Game Fun Facts",
      subtitle: "Discover curiosities in an interactive way",

      terminal: {
        title: "> Interactive Terminal - Fun Facts",
        subtitle: 'Type "help" to see available commands'
      },

      placeholder: "Type a command...",
      funFactPrefix: "Fun Fact:",
      commandNotFound: 'Command "{command}" not found. Type "help" to see available commands.',

      help: {
        title: "Available commands:",
        clear: "  clear              - Clear the terminal",
        help:  "  help               - Show commands with hints only",
        helpWithAnswers: "  help_w_answers     - Show commands with hints and answers"
      },

      footer: {
        help: 'Type "help" for help',
        online: "Online"
      },

      tip: {
        label: "Tip",
        text: "This is an interactive terminal. Try typing commands and discover fun facts!"
      },

      facts: {
        hello_world: {
          fact: "My first contact with programming was writing a Hello World and being genuinely impressed.",
          hint: "The classic everyone writes first."
        },
        bug: {
          fact: "I've lost hours because of a bug that was just a semicolon.",
          hint: "Sometimes it's small, but it breaks everything."
        },
        night_mode: {
          fact: "I work better at night, with music and fewer distractions.",
          hint: "Less light, more focus."
        },
        deadline: {
          fact: "Under pressure, I become surprisingly productive.",
          hint: "When time starts running out."
        },
        learning: {
          fact: "I'm always learning something new — out of curiosity, not obligation.",
          hint: "It never ends."
        },
        side_project: {
          fact: "Personal projects are where I evolve the most.",
          hint: "Built with passion."
        },
        easter_egg: {
          fact: "If you look closely, you'll always find something hidden.",
          hint: "Not everything is documented 😉"
        },
        russia: {
          fact: "I'm passionate about learning the flags of all countries in the world.",
          hint: "Largest country in the world."
        }
      }
    },

    footer: {
      about: {
        headline: "Developer & Innovator",
        bio: "Passionate about technology, innovation and creating solutions that make a difference.",
        downloadCV: "Download CV"
      },
      quickLinks: {
        title: "Quick Links",
        about: "About",
        projects: "Projects",
        schools: "Education",
        skills: "Skills"
      },
      moreLinks: {
        title: "Explore",
        techRadar: "Tech Radar",
        blog: "Blog",
        testimonials: "Testimonials",
        contact: "Contact"
      },
      contact: {
        title: "Connect"
      },
      bottom: {
        copyright: "© {year} João Sousa. Made with",
        backToTop: "Back to Top"
      }
    },

    errorPage: {
      title: "Oops! Page Not Found",
      labels: {
        error: "Error:",
        warning: "Warning:",
        info: "Info:"
      },
      messages: {
        error: "This page has been abducted by aliens",
        warning: "Or maybe it never existed 🤔",
        info: "But don't worry, we'll fix it!"
      },
      jokes: [
        "// TODO: Find this page",
        "try { findPage() } catch { return 404; }",
        "if (pageExists) { show() } else { cry() }",
        "undefined is not a function... not this page either!",
        "Error: Cannot read property 'page' of undefined"
      ],
      suggestions: {
        text: "While I figure out what happened, you can:",
        coffee: { title: "Have a Coffee ☕", desc: "Debugging without coffee doesn’t count" },
        stack: { title: "Check Stack Overflow 📚", desc: "The solution is always there!" },
        restart: { title: "Restart the Computer 🔄", desc: "The universal solution for everything" }
      },
      actions: { home: "Go to Homepage", back: "← Go Back" },
      easterEgg: "Error #404 | Stack Trace: [HomePage → ???] | Suggestion: git checkout homepage",
      proTip: { label: "Pro tip:", text: "Ctrl+Z doesn't work in real life... nor here 😅" }
    },

    booksPage: {
      backHome: "Back to Homepage",
      title: "Library",
      subtitle: "All books I've read and that left a mark",
      stats: {
        total: "Books Read",
        featured: "Featured"
      },
      noBooks: "No books available at the moment.",
      featuredBadge: "Featured",
      viewOnGoogle: "View on Google Books"
    },

    blogPage: {
      backHome: "Back to Homepage",
      title: "Blog",
      subtitle: "Articles about technology, programming, and innovation",
      stats: {
        published: "Published Posts"
      },
      noPosts: "No posts published at the moment.",
      readMore: "Read full article",
      backToBlog: "Back to Blog",
      readingTime: "{minutes} min read",
      share: "Share",
      copiedLink: "Link copied to clipboard!",
      notFound: "Post not found",
      tags: "Tags",
      readMorePrompt: "Enjoyed this article? Read more!"
    },

    coursesPage: {
      backHome: "Back to home",
      title: "Licenses & Certifications",
      subtitle: "All courses and certifications that complement my education",

      stats: {
        total: "Total Courses",
        featured: "Featured",
        highImportance: "High Importance"
      },

      featured: "Featured",
      viewCertificate: "View Certificate",
      empty: "No courses available at the moment.",

      importance: {
        high: "High Importance",
        medium: "Medium Importance",
        low: "Low Importance"
      }
    },

    projectsPage: {
      back: "Back to homepage",
      hero: {
        title: "All Projects",
        subtitle: "Explore all the projects I have developed"
      },
      stats: {
        active: "Active Projects",
        featured: "Featured"
      },
      featured: "Featured",
      viewDetails: "View Details",
      demo: "Demo",
      empty: "No projects available at the moment."
    },

    projectDetail: {
      back: "Back to projects",
      backToProjects: "Back to projects",
      notFound: "Project not found",
      featured: "Featured Project",
      live: "View Live Project",
      github: "View on GitHub",
      technologies: "Technologies",
      about: "About the Project",
      cta: "Liked this project? See more!",
      viewAll: "View All Projects",
      relatedPosts: {
        section: "Related Articles",
        subtitle: "Blog posts related to this project",
        readPost: "Read Article"
      }
    },

    auth: {
      title: "Admin Access",
      subtitle: "Restricted area • Authentication required",
      back: "Back to homepage",

      username: "Username",
      password: "Password",
      usernamePlaceholder: "Enter your username",
      passwordPlaceholder: "Enter your password",

      submit: "Enter Admin",
      loading: "Authenticating...",

      securityTitle: "Secure connection",
      securityText: "Your data is protected with end-to-end encryption",

      footer: "Developed with ❤️ by João Sousa",

      errors: {
        title: "Authentication error",
        invalidCredentials: "Invalid username or password",
        generic: "Login error. Please try again."
      }
    }
}

export default en
