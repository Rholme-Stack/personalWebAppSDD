export interface SocialLink {
  network: 'linkedin' | 'github' | 'instagram';
  label: string;
  url: string;
  icon: string;
}

export interface StackItem {
  name: string;
  logo: string;
}

export interface Profile {
  name: string;
  photo: string;
  socialLinks: SocialLink[];
}

export const PROFILE: Profile = {
  name: 'Rodrigo Holme',
  photo: 'images/rodrigo.webp',
  socialLinks: [
    {
      network: 'linkedin',
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/rodrigo-holme',
      icon: 'icons/linkedin.svg',
    },
    {
      network: 'github',
      label: 'GitHub',
      url: 'https://github.com/Rholme-Stack',
      icon: 'icons/github.svg',
    },
    {
      network: 'instagram',
      label: 'Instagram',
      // TODO: replace with the Instagram profile URL (https://www.instagram.com/<user>/).
      url: 'https://www.instagram.com/',
      icon: 'icons/instagram.svg',
    },
  ],
};

export const STACK: StackItem[] = [
  { name: '.NET', logo: 'icons/dotnet.svg' },
  { name: 'Angular', logo: 'icons/angular.svg' },
  { name: 'SQL', logo: 'icons/sql.svg' },
];

export const LINKEDIN = PROFILE.socialLinks.find((link) => link.network === 'linkedin')!;
