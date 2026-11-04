export type Lang = 'en' | 'es' | 'pt-BR';

/** Languages offered in the selector. Labels are always written in their own language. */
export const LANGS: readonly { value: Lang; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'pt-BR', label: 'Português (Brasil)' },
];

export interface Translations {
  nav: { about: string; stack: string; contact: string; languageLabel: string };
  role: string;
  about: {
    title: string;
    bio: string;
    photoAlt: string;
    socialLabel: (label: string) => string;
  };
  stack: { title: string };
  photos: { title: string; comingSoon: string };
  contact: {
    title: string;
    nameLabel: string;
    emailLabel: string;
    messageLabel: string;
    submit: string;
    errors: {
      required: string;
      email: string;
      maxLength: (n: number) => string;
      minLength: (n: number) => string;
    };
    notice: string;
  };
}

const en: Translations = {
  nav: { about: 'About Me', stack: 'Stack', contact: 'Contact', languageLabel: 'Language' },
  role: 'Developer',
  about: {
    title: 'About Me',
    bio: "I'm a developer working with .NET, Angular and SQL. When I'm not coding, you'll find me doing sport: running and cycling are my thing.",
    photoAlt: 'Illustration of Rodrigo Holme',
    socialLabel: (label) => `Rodrigo Holme on ${label} (opens in a new tab)`,
  },
  stack: { title: 'Stack' },
  photos: { title: 'Photos', comingSoon: 'Coming soon' },
  contact: {
    title: 'Contact',
    nameLabel: 'Name',
    emailLabel: 'Email',
    messageLabel: 'Message',
    submit: 'Send',
    errors: {
      required: 'This field is required',
      email: 'Enter a valid email',
      maxLength: (n) => `Maximum ${n} characters`,
      minLength: (n) => `Minimum ${n} characters`,
    },
    notice: 'The contact form is not active yet. You can reach me on',
  },
};

const es: Translations = {
  nav: { about: 'Sobre mí', stack: 'Stack', contact: 'Contacto', languageLabel: 'Idioma' },
  role: 'Desarrollador',
  about: {
    title: 'Sobre mí',
    bio: 'Soy desarrollador y trabajo con .NET, Angular y SQL. Cuando no estoy programando, me encontrarás haciendo deporte: correr y montar en bici son lo mío.',
    photoAlt: 'Ilustración de Rodrigo Holme',
    socialLabel: (label) => `Rodrigo Holme en ${label} (se abre en una pestaña nueva)`,
  },
  stack: { title: 'Stack' },
  photos: { title: 'Fotos', comingSoon: 'Próximamente' },
  contact: {
    title: 'Contacto',
    nameLabel: 'Nombre',
    emailLabel: 'Correo electrónico',
    messageLabel: 'Mensaje',
    submit: 'Enviar',
    errors: {
      required: 'Este campo es obligatorio',
      email: 'Introduce un email válido',
      maxLength: (n) => `Máximo ${n} caracteres`,
      minLength: (n) => `Mínimo ${n} caracteres`,
    },
    notice: 'El formulario de contacto aún no está activo. Puedes escribirme por',
  },
};

const ptBR: Translations = {
  nav: { about: 'Sobre mim', stack: 'Stack', contact: 'Contato', languageLabel: 'Idioma' },
  role: 'Desenvolvedor',
  about: {
    title: 'Sobre mim',
    bio: 'Sou desenvolvedor e trabalho com .NET, Angular e SQL. Quando não estou programando, você vai me encontrar praticando esporte: corrida e ciclismo são a minha praia.',
    photoAlt: 'Ilustração de Rodrigo Holme',
    socialLabel: (label) => `Rodrigo Holme no ${label} (abre em uma nova aba)`,
  },
  stack: { title: 'Stack' },
  photos: { title: 'Fotos', comingSoon: 'Em breve' },
  contact: {
    title: 'Contato',
    nameLabel: 'Nome',
    emailLabel: 'E-mail',
    messageLabel: 'Mensagem',
    submit: 'Enviar',
    errors: {
      required: 'Este campo é obrigatório',
      email: 'Digite um e-mail válido',
      maxLength: (n) => `Máximo de ${n} caracteres`,
      minLength: (n) => `Mínimo de ${n} caracteres`,
    },
    notice: 'O formulário de contato ainda não está ativo. Você pode me escrever pelo',
  },
};

export const TRANSLATIONS: Record<Lang, Translations> = { en, es, 'pt-BR': ptBR };
