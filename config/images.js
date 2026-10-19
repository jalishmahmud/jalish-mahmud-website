// Keep local images in public/images/<section>/ and reference them by URL.
// Example: experience.teamPhoto = imagePath("experience", "team-photo.webp").
export function imagePath(section, fileName) {
  return `/images/${section}/${fileName}`;
}

// Existing remote photos remain available until local replacements are added.
// Replace a value with imagePath(section, fileName) after adding that file.
export const siteImages = {
  hero: {},
  skills: {},
  experience: {
    jbTeamCollaboration: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=85",
    jbOfficeDiscussion: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=85",
    jbCelebration: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=900&q=85",
    jbCommunityEvent: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=85",
    shellTeamOutdoors: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=85",
    shellTeamMeeting: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=85",
    shellCelebration: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85",
    shellConcert: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=85",
    datafairOffice: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85",
    datafairOpenOffice: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=85",
    ifindWorkshop: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=85",
    ifindDesigners: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=85",
  },
  gallery: {
    coxBeach: "https://picsum.photos/seed/coxbazar-1/900/600",
    coxShorePortrait: "https://picsum.photos/seed/coxbazar-portrait-1/600/900",
    coxSunset: "https://picsum.photos/seed/coxbazar-2/900/600",
    coxCoastPortrait: "https://picsum.photos/seed/coxbazar-portrait-2/600/900",
    coxWaves: "https://picsum.photos/seed/coxbazar-3/900/600",
    saintIsland: "https://picsum.photos/seed/saintmartin-1/900/600",
    saintBeachPortrait: "https://picsum.photos/seed/saintmartin-portrait-1/600/900",
    saintWater: "https://picsum.photos/seed/saintmartin-2/900/600",
    saintPalmsPortrait: "https://picsum.photos/seed/saintmartin-portrait-2/600/900",
    sundarbanForest: "https://picsum.photos/seed/sundarban-1/900/600",
    sundarbanRootsPortrait: "https://picsum.photos/seed/sundarban-portrait-1/600/900",
    sundarbanBoat: "https://picsum.photos/seed/sundarban-2/900/600",
    sundarbanCreekPortrait: "https://picsum.photos/seed/sundarban-portrait-2/600/900",
    sundarbanRivers: "https://picsum.photos/seed/sundarban-3/900/600",
  },
  projects: {},
  blog: {},
  education: {},
  contact: {},
};

export function getSectionImage(section, key) {
  const src = siteImages[section]?.[key];
  if (!src) throw new Error(`Missing image mapping for ${section}.${key}`);
  return src;
}
