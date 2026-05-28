export const TOOLS = [
  {
    name: 'Tailwind CSS',
    category: 'Library',
    icon: 'fa-palette',
    description:
      'A utility-first CSS framework for rapidly building custom user interfaces. Highly customizable via design tokens.',
    ratings: { ease: 5, custom: 4, perf: 5, cost: 5 },
    bestCases: ['Rapid prototyping', 'Design system scaling', 'Utility-first workflows'],
    worstCases: ['Highly unique animations', 'Complex SVG styling', 'Pixel-perfect print CSS'],
    differentiation:
      'Superior developer experience through inline utility classes and JIT compilation engine.',
    proximity: ['Bootstrap', 'PostCSS', 'CSS Modules'],
  },
  {
    name: 'React',
    category: 'Frontend',
    icon: 'fa-atom',
    description:
      'A JavaScript library for building user interfaces using a component-based architecture with virtual DOM diffing.',
    ratings: { ease: 3, custom: 5, perf: 3, cost: 5 },
    bestCases: ['Complex interactive UIs', 'Component reuse ecosystems', 'Stateful applications'],
    worstCases: ['Simple static sites', 'Minimal JS budgets', 'SEO-critical pages'],
    differentiation:
      'Unmatched ecosystem and declarative component model pioneered by Meta.',
    proximity: ['Vue', 'Angular', 'Svelte', 'Preact'],
  },
  {
    name: 'Next.js',
    category: 'Frontend',
    icon: 'fa-forward',
    description:
      'A React framework with hybrid static and server rendering, TypeScript support, and built-in routing.',
    ratings: { ease: 4, custom: 4, perf: 4, cost: 4 },
    bestCases: ['Full-stack React apps', 'E-commerce platforms', 'Content-driven sites'],
    worstCases: ['Simple SPAs', 'Low-level API services', 'Microservice backends'],
    differentiation:
      'Seamless SSR/SSG/ISR rendering modes with zero-config file-based routing.',
    proximity: ['Remix', 'Nuxt', 'Gatsby', 'Astro'],
  },
];
