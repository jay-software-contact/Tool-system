/**
 * Template Data — hardcoded sample data for the Templates view.
 * Each template has: name, description, tools[], color, icon.
 */

export const TEMPLATES = [
  {
    name: "E-Commerce Stack",
    description: "Full-stack e-commerce with payments and inventory",
    tools: ["Next.js", "Tailwind CSS", "Stripe", "Supabase"],
    color: "#22C55E",
    icon: "fa-cart-shopping",
  },
  {
    name: "Blog Platform",
    description: "Content-first publishing platform with MDX support",
    tools: ["Next.js", "MDX", "Sanity", "Tailwind CSS"],
    color: "#3B82F6",
    icon: "fa-feather",
  },
  {
    name: "SaaS Dashboard",
    description: "Multi-tenant admin dashboard with analytics",
    tools: ["Next.js", "TypeScript", "Supabase", "D3.js"],
    color: "#8B5CF6",
    icon: "fa-chart-pie",
  },
];
