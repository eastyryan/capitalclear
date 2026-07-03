/**
 * Neighbourhood landing-page data (local SEO). One entry per community we
 * serve; each renders a bilingual page at /areas/[slug] targeting searches
 * like "Barrhaven snow removal". FSAs come from the service-area geofence.
 */

export interface ServiceArea {
  slug: string;
  name: { en: string; fr: string };
  /** FSAs (postal prefixes) that fall in this community. */
  fsas: string[];
  /** Short local blurb under the page title. */
  blurb: { en: string; fr: string };
  /** A couple of locally-known landmarks/streets for flavour + relevance. */
  landmarks: { en: string; fr: string };
}

export const SERVICE_AREAS: ServiceArea[] = [
  {
    slug: 'barrhaven',
    name: { en: 'Barrhaven', fr: 'Barrhaven' },
    fsas: ['K2J', 'K2R'],
    blurb: {
      en: "Barrhaven's long suburban driveways fill in fast when the wind blows across the open south end. Our local pros clear singles, doubles and walkways across Barrhaven and Barrhaven South.",
      fr: "Les longues entrées de banlieue de Barrhaven se remplissent vite quand le vent souffle sur le sud ouvert. Nos pros locaux dégagent entrées simples, doubles et allées partout à Barrhaven et Barrhaven-Sud."
    },
    landmarks: {
      en: 'Strandherd, Longfields, Half Moon Bay and Stonebridge',
      fr: 'Strandherd, Longfields, Half Moon Bay et Stonebridge'
    }
  },
  {
    slug: 'kanata',
    name: { en: 'Kanata', fr: 'Kanata' },
    fsas: ['K2K', 'K2L', 'K2M', 'K2T', 'K2V', 'K2W'],
    blurb: {
      en: "From Beaverbrook to Bridlewood, Kanata gets some of the deepest drifts in the city. We dispatch vetted local pros across Kanata North and South so your driveway is clear before the commute.",
      fr: "De Beaverbrook à Bridlewood, Kanata reçoit parmi les plus grosses accumulations de la ville. Nous envoyons des pros locaux vérifiés dans Kanata Nord et Sud pour que votre entrée soit dégagée avant l'heure de pointe."
    },
    landmarks: {
      en: 'Beaverbrook, Bridlewood, Glen Cairn, Morgan’s Grant and Kanata Lakes',
      fr: 'Beaverbrook, Bridlewood, Glen Cairn, Morgan’s Grant et Kanata Lakes'
    }
  },
  {
    slug: 'orleans',
    name: { en: 'Orléans', fr: 'Orléans' },
    fsas: ['K1C', 'K1W', 'K4A'],
    blurb: {
      en: "Orléans catches the storm tail coming up the river — and the plows bury the end of your driveway right after you shovel it. Our pros clear Fallingbrook, Chapel Hill and Avalon on demand.",
      fr: "Orléans reçoit la fin des tempêtes qui remontent la rivière — et les charrues enterrent le bout de votre entrée juste après que vous l'ayez pelletée. Nos pros dégagent Fallingbrook, Chapel Hill et Avalon sur demande."
    },
    landmarks: {
      en: 'Fallingbrook, Chapel Hill, Avalon and Queenswood Heights',
      fr: 'Fallingbrook, Chapel Hill, Avalon et Queenswood Heights'
    }
  },
  {
    slug: 'nepean',
    name: { en: 'Nepean', fr: 'Nepean' },
    fsas: ['K2C', 'K2E', 'K2G', 'K2H', 'K2J'],
    blurb: {
      en: "Nepean's mix of mature streets and busy arterials means heavy, plow-packed snow at the foot of the driveway. We clear Centrepointe, Bells Corners and Craig Henry fast, with photo proof.",
      fr: "Le mélange de rues matures et d'artères achalandées de Nepean laisse une neige lourde et compactée au pied de l'entrée. Nous dégageons Centrepointe, Bells Corners et Craig Henry rapidement, preuve photo à l'appui."
    },
    landmarks: {
      en: 'Centrepointe, Bells Corners, Craig Henry and Merivale',
      fr: 'Centrepointe, Bells Corners, Craig Henry et Merivale'
    }
  },
  {
    slug: 'stittsville',
    name: { en: 'Stittsville', fr: 'Stittsville' },
    fsas: ['K2S'],
    blurb: {
      en: "On the city's western edge, Stittsville takes the brunt of open-field blowing snow. Our pros run Stittsville Main to Fernbank so you wake up to a cleared driveway, not a snowbank.",
      fr: "En bordure ouest de la ville, Stittsville encaisse la poudrerie des champs ouverts. Nos pros couvrent de Stittsville Main à Fernbank pour que vous vous réveilliez devant une entrée dégagée, pas un banc de neige."
    },
    landmarks: {
      en: 'Stittsville Main, Fernbank, Crossing Bridge and Jackson Trails',
      fr: 'Stittsville Main, Fernbank, Crossing Bridge et Jackson Trails'
    }
  },
  {
    slug: 'gloucester',
    name: { en: 'Gloucester', fr: 'Gloucester' },
    fsas: ['K1B', 'K1J', 'K1T', 'K1V', 'K1X'],
    blurb: {
      en: "From Beacon Hill to Greenboro and South Keys, Gloucester's neighbourhoods get steady lake-effect dumps all winter. A vetted local pro clears your driveway and walkway on demand.",
      fr: "De Beacon Hill à Greenboro et South Keys, les quartiers de Gloucester reçoivent des chutes régulières tout l'hiver. Un pro local vérifié dégage votre entrée et votre allée sur demande."
    },
    landmarks: {
      en: 'Beacon Hill, Blackburn Hamlet, Greenboro and South Keys',
      fr: 'Beacon Hill, Blackburn Hamlet, Greenboro et South Keys'
    }
  },
  {
    slug: 'ottawa-central',
    name: { en: 'Central Ottawa', fr: 'Ottawa-Centre' },
    fsas: ['K1P', 'K1R', 'K1S', 'K1Y', 'K1Z', 'K2P', 'K1N'],
    blurb: {
      en: "Tight downtown driveways, shared laneways and street-parking bans make central Ottawa snow a headache. Our pros handle the Glebe, Centretown, Hintonburg and Westboro with compact equipment.",
      fr: "Entrées étroites, ruelles partagées et interdictions de stationnement font de la neige du centre-ville un casse-tête. Nos pros couvrent le Glebe, Centretown, Hintonburg et Westboro avec de l'équipement compact."
    },
    landmarks: {
      en: 'The Glebe, Centretown, Hintonburg, Westboro and Sandy Hill',
      fr: 'le Glebe, Centretown, Hintonburg, Westboro et la Côte-de-Sable'
    }
  }
];

export function getArea(slug: string): ServiceArea | undefined {
  return SERVICE_AREAS.find((a) => a.slug === slug);
}
