import Fuse from 'fuse.js';

import periods from '../data/periods.json';
import leaders from '../data/leaders.json';
import divisions from '../data/divisions.json';
import archives from '../data/archives.json';

// Compile all organizational assets into a single search corpus
export function buildSearchCorpus() {
  const corpus = [];

  periods.forEach(p => {
    corpus.push({
      type: 'period',
      id: p.id,
      title: `Periode ${p.year}`,
      content: p.summary,
      keywords: p.programs.join(', '),
      link: `/periods/${p.id}`
    });
  });

  leaders.forEach(l => {
    corpus.push({
      type: 'leader',
      id: l.id,
      title: `Ketua: ${l.name}`,
      content: l.biography,
      keywords: l.achievements.join(', '),
      link: `/leaders#${l.id}`
    });
  });

  divisions.forEach(d => {
    corpus.push({
      type: 'division',
      id: d.id,
      title: `Divisi ${d.name}`,
      content: d.description + ' ' + d.philosophy,
      keywords: d.responsibilities.join(', '),
      link: `/divisions/${d.id}`
    });
  });

  archives.forEach(a => {
    corpus.push({
      type: 'document',
      id: a.id,
      title: a.title,
      content: `Kategori: ${a.category}, Tanggal: ${a.date}`,
      keywords: a.tags.join(', '),
      link: `/archive#${a.id}`
    });
  });

  return corpus;
}

const corpus = buildSearchCorpus();

// Configure Fuse.js for fuzzy natural language searching
const fuse = new Fuse(corpus, {
  keys: [
    { name: 'title', weight: 0.5 },
    { name: 'content', weight: 0.3 },
    { name: 'keywords', weight: 0.2 }
  ],
  includeScore: true,
  threshold: 0.4, // Lower threshold means more strict matching
});

export function searchMatraAI(query) {
  if (!query || query.trim() === '') return [];
  const results = fuse.search(query);
  return results.map(result => result.item);
}
