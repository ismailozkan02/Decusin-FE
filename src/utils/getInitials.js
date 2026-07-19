export default function getInitials(name = '') {
  return name
    .replace(/\s+/, ' ')
    .split(' ')
    .slice(0, 2)
    .map(v => v && v[0].toUpperCase())
    .join('');
}

// ilk 2 kelimeninl ilk 2 harfi