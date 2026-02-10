import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Language = 'en' | 'nb';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'header.title': 'Altinn Access Manager',
    'header.packages': 'Packages',
    'header.search': 'Search',
    'header.roles': 'Roles',
    'header.types': 'Types',
    'header.clientAdmin': 'Client Admin',
    'header.login': 'Login with ID-porten',
    'header.logout': 'Log out',
    
    // Home page
    'home.tagline': 'Reference Implementation',
    'home.title': 'The Ultimate Access Management Tool',
    'home.subtitle': 'Explore and showcase the Altinn Authorization API with this comprehensive reference implementation. Manage roles, delegations, consents, and system users with ease.',
    'home.browsePackages': 'Browse Packages',
    'home.viewRoles': 'View Roles',
    'home.exploreMetadata': 'Explore Metadata',
    
    // Cards
    'card.accessPackages': 'Access Packages',
    'card.accessPackages.desc': 'Browse packages organized by area groups and areas.',
    'card.searchPackages': 'Search Packages',
    'card.searchPackages.desc': 'Search for packages by name or description.',
    'card.roles': 'Roles',
    'card.roles.desc': 'View all available roles in the authorization system.',
    'card.organizationTypes': 'Organization Types',
    'card.organizationTypes.desc': 'Browse organization subtypes and their configurations.',
    'card.clientAdmin': 'Client Admin',
    'card.clientAdmin.desc': 'Manage client delegations and agents for your organization.',
    'card.new': 'New',
    
    // Features
    'features.title': 'Showcase Authorization API Features',
    'features.subtitle': 'This reference implementation demonstrates all major capabilities of the Altinn Authorization API.',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.back': 'Back',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.noResults': 'No results found',
    
    // Language
    'language.select': 'Language',
    'language.en': 'English',
    'language.nb': 'Norwegian',
  },
  nb: {
    // Header
    'header.title': 'Altinn Tilgangsadministrasjon',
    'header.packages': 'Pakker',
    'header.search': 'Søk',
    'header.roles': 'Roller',
    'header.types': 'Typer',
    'header.clientAdmin': 'Klientadmin',
    'header.login': 'Logg inn med ID-porten',
    'header.logout': 'Logg ut',
    
    // Home page
    'home.tagline': 'Referanseimplementasjon',
    'home.title': 'Det ultimate verktøy for tilgangsstyring',
    'home.subtitle': 'Utforsk og vis frem Altinn Autorisasjons-API med denne omfattende referanseimplementasjonen. Administrer roller, delegeringer, samtykker og systembrukere med letthet.',
    'home.browsePackages': 'Bla i pakker',
    'home.viewRoles': 'Se roller',
    'home.exploreMetadata': 'Utforsk metadata',
    
    // Cards
    'card.accessPackages': 'Tilgangspakker',
    'card.accessPackages.desc': 'Bla gjennom pakker organisert etter områdegrupper og områder.',
    'card.searchPackages': 'Søk etter pakker',
    'card.searchPackages.desc': 'Søk etter pakker etter navn eller beskrivelse.',
    'card.roles': 'Roller',
    'card.roles.desc': 'Se alle tilgjengelige roller i autorisasjonssystemet.',
    'card.organizationTypes': 'Organisasjonstyper',
    'card.organizationTypes.desc': 'Bla gjennom organisasjonsundertyper og deres konfigurasjoner.',
    'card.clientAdmin': 'Klientadmin',
    'card.clientAdmin.desc': 'Administrer klientdelegeringer og agenter for din organisasjon.',
    'card.new': 'Ny',
    
    // Features
    'features.title': 'Vis frem autorisasjons-API-funksjoner',
    'features.subtitle': 'Denne referanseimplementasjonen demonstrerer alle hovedfunksjonene i Altinn Autorisasjons-API.',
    
    // Common
    'common.loading': 'Laster...',
    'common.error': 'Feil',
    'common.back': 'Tilbake',
    'common.save': 'Lagre',
    'common.cancel': 'Avbryt',
    'common.delete': 'Slett',
    'common.add': 'Legg til',
    'common.search': 'Sok',
    'common.noResults': 'Ingen resultater funnet',
    
    // Language
    'language.select': 'Sprak',
    'language.en': 'Engelsk',
    'language.nb': 'Norsk',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get from localStorage, default to 'nb' (Norwegian)
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'nb') ? saved : 'nb';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
