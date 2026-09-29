import type { Config } from "tailwindcss";

// Paleta amostrada diretamente do arquivo oficial de cores dos 25 anos (COLORS.jpg)
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brasa: "#D14A49",     // vermelho do canto superior esquerdo
        cobre: "#D47C3C",     // laranja da borda direita
        aurora: "#EDBD81",    // brilho pêssego do topo
        malva: "#A6546A",     // centro do degradê
        rosa: "#C17A92",      // faixa rosada inferior
        violeta: "#7B5F90",   // violeta dos cantos inferiores
        vinho: "#2E1729",     // tinta escura derivada do violeta, para texto sobre claro
        nevoa: "#F7F1F3",     // fundo claro do painel
      },
      fontFamily: {
        sans: ["var(--font-proxima)"],
      },
    },
  },
  plugins: [],
} satisfies Config;
