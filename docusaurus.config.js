const config = {
  title: "CyberGym",
  tagline:
    "A Realistic Large-Scale Benchmark for AI Cybersecurity Capabilities",
  favicon: "img/favicon.ico",

  url: "https://arise-ai-security.github.io",
  baseUrl: "/",

  organizationName: "arise-ai-security", // GitHub org/user name
  projectName: "docs", // GitHub repo name

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      ({
        docs: {
          routeBasePath: "/", // This makes docs the root
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/arise-ai-security/docs/tree/main/docs/",
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  // Conditionally add mermaid theme if it's installed
  themes: (() => {
    try {
      require.resolve('@docusaurus/theme-mermaid');
      return ['@docusaurus/theme-mermaid'];
    } catch {
      console.warn('Warning: @docusaurus/theme-mermaid is not installed. Mermaid diagrams will not be rendered.');
      return [];
    }
  })(),
  
  markdown: {
    mermaid: (() => {
      try {
        require.resolve('@docusaurus/theme-mermaid');
        return true;
      } catch {
        return false;
      }
    })(),
  },

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: "img/cybergym-social-card.jpg",
      navbar: {
        title: "Home",
        logo: {
          src: "img/logo.avif",
          srcDark: "img/logo-invert.avif",
        },
        items: [
          {
            type: "dropdown",
            label: "Weekly Reports",
            position: "left",
            items: [
              {
                label: "Week 1 (2025-10-03)",
                to: "/weekly/week1-2025-10-03",
              },
              {
                label: "Week 2 (2025-10-09)",
                to: "/weekly/week2-2025-10-09",
              },
              // Add more weekly reports here
            ],
          },
          {
            href: "https://github.com/arise-ai-security/docs",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Literature Reviews",
            items: [
              {
                label: "CyberGym",
                to: "/cybergym",
              },
              {
                label: "SEC-Bench",
                to: "/sec-bench",
              },
              {
                label: "Faultline",
                to: "/faultline",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/arise-ai-security/docs",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} ARiSE Lab Projects. Built with Docusaurus.`,
      },
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: false,
        },
      },
      prism: (() => {
        try {
          // Try to load prism-react-renderer themes
          let lightTheme, darkTheme;

          // Try newer version first
          try {
            const {themes} = require('prism-react-renderer');
            lightTheme = themes.github;
            darkTheme = themes.dracula;
          } catch {
            // Try older version format
            try {
              lightTheme = require('prism-react-renderer/themes/github');
              darkTheme = require('prism-react-renderer/themes/dracula');
            } catch {
              // If prism-react-renderer is not installed, use undefined
              // Docusaurus will use its default themes
              lightTheme = undefined;
              darkTheme = undefined;
            }
          }
          
          return {
            theme: lightTheme,
            darkTheme: darkTheme,
            additionalLanguages: ['bash', 'python', 'powershell', 'yaml', 'json'],
          };
        } catch (error) {
          // If all fails, return minimal config
          console.warn('Warning: Could not load prism-react-renderer. Using default code highlighting.');
          return {
            additionalLanguages: ['bash', 'python', 'powershell', 'yaml', 'json'],
          };
        }
      })(),
    }),
};

module.exports = config;
