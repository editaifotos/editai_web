import type { Config } from "tailwindcss";

/* Em Tailwind v4 a configuração de tema é feita via CSS (@theme no globals.css).
   Este arquivo existe apenas para compatibilidade com ferramentas que o leem. */
const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
