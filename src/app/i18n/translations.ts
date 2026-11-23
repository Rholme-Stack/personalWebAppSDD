export type Lang = 'en' | 'es' | 'pt-BR';

/** Languages offered in the selector. Labels are always written in their own language. */
export const LANGS: readonly { value: Lang; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'pt-BR', label: 'Português (Brasil)' },
];

export interface Translations {
  nav: {
    about: string;
    stack: string;
    contact: string;
    /** Accessible name of the contact button: starts with the visible text (WCAG 2.5.3). */
    contactLabel: string;
    languageLabel: string;
  };
  role: string;
  about: {
    title: string;
    bio: string;
    photoAlt: string;
    socialLabel: (label: string) => string;
  };
  stack: { title: string };
  photos: { title: string; comingSoon: string };
}

const en: Translations = {
  nav: {
    about: 'About Me',
    stack: 'Stack',
    contact: 'Contact',
    contactLabel: 'Contact Rodrigo Holme on LinkedIn (opens in a new tab)',
    languageLabel: 'Language',
  },
  role: 'Developer',
  about: {
    title: 'About Me',
    bio: "I'm a developer working with .NET, Angular and SQL. When I'm not coding, you'll find me doing sport: running and cycling are my thing.",
    photoAlt: 'Photo of Rodrigo Holme',
    socialLabel: (label) => `Rodrigo Holme on ${label} (opens in a new tab)`,
  },
  stack: { title: 'Stack' },
  photos: { title: 'Photos', comingSoon: 'Coming soon' },
};

const es: Translations = {
  nav: {
    about: 'Sobre mí',
    stack: 'Stack',
    contact: 'Contacto',
    contactLabel: 'Contacto: Rodrigo Holme en LinkedIn (se abre en una pestaña nueva)',
    languageLabel: 'Idioma',
  },
  role: 'Desarrollador',
  about: {
    title: 'Sobre mí',
    bio: 'Soy desarrollador y trabajo con .NET, Angular y SQL. Cuando no estoy programando, me encontrarás haciendo deporte: correr y montar en bici son lo mío.',
    photoAlt: 'Foto de Rodrigo Holme',
    socialLabel: (label) => `Rodrigo Holme en ${label} (se abre en una pestaña nueva)`,
  },
  stack: { title: 'Stack' },
  photos: { title: 'Fotos', comingSoon: 'Próximamente' },
};

const ptBR: Translations = {
  nav: {
    about: 'Sobre mim',
    stack: 'Stack',
    contact: 'Contato',
    contactLabel: 'Contato: Rodrigo Holme no LinkedIn (abre em uma nova aba)',
    languageLabel: 'Idioma',
  },
  role: 'Desenvolvedor',
  about: {
    title: 'Sobre mim',
    bio: 'Sou desenvolvedor e trabalho com .NET, Angular e SQL. Quando não estou programando, você vai me encontrar praticando esporte: corrida e ciclismo são a minha praia.',
    photoAlt: 'Foto de Rodrigo Holme',
    socialLabel: (label) => `Rodrigo Holme no ${label} (abre em uma nova aba)`,
  },
  stack: { title: 'Stack' },
  photos: { title: 'Fotos', comingSoon: 'Em breve' },
};

export const TRANSLATIONS: Record<Lang, Translations> = { en, es, 'pt-BR': ptBR };
