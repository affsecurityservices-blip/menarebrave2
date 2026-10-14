export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
export const IMGBB_API_KEY = process.env.EXPO_PUBLIC_IMGBB_API_KEY;
export const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

export const COMMUNITIES = [
  {
    id: 'career',
    name: 'Career & Ambition',
    description: 'Post about work pressure, discuss salary growth, promotions, and career switches.',
    memberCount: 1420,
    icon: 'briefcase',
  },
  {
    id: 'breakup',
    name: 'Heartbreak & Healing',
    description: 'Post-breakup support. Let it out, focus on self-improvement, and rebuild.',
    memberCount: 980,
    icon: 'heart-broken',
  },
  {
    id: 'fatherhood',
    name: 'Fatherhood & Family',
    description: 'Dads talking about parenting, marriage, family responsibilities, and work-life balance.',
    memberCount: 540,
    icon: 'baby-carriage',
  },
  {
    id: 'fitness',
    name: 'Iron Shield (Fitness)',
    description: 'Gym motivation, workout routines, mental health through physical training.',
    memberCount: 2110,
    icon: 'dumbbell',
  },
];

export const MOODS = [
  { key: 'great', label: 'Great', icon: 'emoticon-excited', color: '#FFD100' },
  { key: 'good', label: 'Good', icon: 'emoticon-happy', color: '#2A9D8F' },
  { key: 'stressed', label: 'Stressed', icon: 'emoticon-sad', color: '#C1121F' },
  { key: 'neutral', label: 'Neutral', icon: 'emoticon-neutral', color: '#8A8A9E' },
  { key: 'angry', label: 'Angry', icon: 'emoticon-angry', color: '#D62828' },
];

export const getBadgeAndTitle = (username) => {
  if (!username || username === 'Anonymous Member' || username === 'Anonymous') {
    return null;
  }
  const badges = {
    'Bruce_93': { title: 'STOIC WARRIOR', icon: 'shield-crown', color: '#FFD100' },
    'SilentGideon': { title: 'FAMILY SHIELD', icon: 'crown', color: '#FFD100' },
    'Anonymous Bat': { title: 'SENTINEL', icon: 'shield-check', color: '#8A8A9E' },
    'SolidGrit_45': { title: 'CONSISTENCY APEX', icon: 'fire', color: '#FFD100' },
    'SolidBrother': { title: 'RECOVERY LEADER', icon: 'account-supervisor', color: '#FFD100' },
    'IronGrip_92': { title: 'IRON MIND', icon: 'dumbbell', color: '#FFD100' },
    'MentorAurelius': { title: 'PHILOSOPHER', icon: 'brain', color: '#FFD100' },
  };
  return badges[username] || { title: 'ELITE BROTHER', icon: 'crown', color: '#FFD100' };
};
