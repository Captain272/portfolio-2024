// Import markdown files as raw strings at build time (Vite ?raw)
import move from '../../blogs/01-move-language-guide.md?raw';
import aptos from '../../blogs/02-aptos-blockchain-guide.md?raw';
import aave from '../../blogs/03-aave-protocol-guide.md?raw';
import aaveVersioning from '../../blogs/04-aave-versioning-events-data.md?raw';
import theGraph from '../../blogs/05-the-graph-protocol-guide.md?raw';
import compound from '../../blogs/06-compound-protocol-guide.md?raw';
import consensus from '../../blogs/2026-02-26-consensus-mechanisms.md?raw';
import hotstuff from '../../blogs/2026-02-26-hotstuff-bft-consensus.md?raw';
import ethernaut from '../../blogs/07-ethernaut-ctf-writeups.md?raw';
import neodym from '../../blogs/08-neodym-ctf-defi-exploits.md?raw';
import aptosIndexer from '../../blogs/09-building-aptos-aave-indexer.md?raw';
import lendingProtocol from '../../blogs/10-building-lending-protocol.md?raw';

export interface BlogMeta {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readTime: string;
  content: string;
}

function estimateReadTime(text: string): string {
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

function extractTitle(md: string): string {
  const match = md.match(/^#\s+(.+)/m);
  return match ? match[1] : 'Untitled';
}

function extractDescription(md: string): string {
  // Grab the first normal paragraph (not a heading, not a list, not metadata)
  const lines = md.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed &&
      !trimmed.startsWith('#') &&
      !trimmed.startsWith('-') &&
      !trimmed.startsWith('*') &&
      !trimmed.startsWith('|') &&
      !trimmed.startsWith('```') &&
      !trimmed.startsWith('**Date') &&
      !trimmed.startsWith('**Topic') &&
      !trimmed.startsWith('**Related') &&
      !trimmed.startsWith('**Previous') &&
      !trimmed.startsWith('[') &&
      !trimmed.match(/^\d+\.\s*\[/) &&
      trimmed !== '---' &&
      trimmed.length > 30
    ) {
      return trimmed.length > 160 ? trimmed.slice(0, 157) + '...' : trimmed;
    }
  }
  return '';
}

function categorize(slug: string): string {
  if (slug.includes('move')) return 'Move Language';
  if (slug.includes('aptos')) return 'Blockchain';
  if (slug.includes('aave')) return 'DeFi';
  if (slug.includes('graph')) return 'Indexing';
  if (slug.includes('compound')) return 'DeFi';
  if (slug.includes('consensus')) return 'Blockchain';
  if (slug.includes('hotstuff')) return 'Blockchain';
  if (slug.includes('ethernaut')) return 'Smart Contract Security';
  if (slug.includes('neodym')) return 'Smart Contract Security';
  if (slug.includes('indexer')) return 'Blockchain';
  if (slug.includes('lending')) return 'DeFi';
  return 'Blockchain';
}

function makeSlug(filename: string): string {
  return filename
    .replace(/\.md$/, '')
    .replace(/^\d+-/, '')
    .replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

const rawFiles: { filename: string; content: string; date: string }[] = [
  { filename: '01-move-language-guide.md', content: move, date: '2025-03-12' },
  { filename: '02-aptos-blockchain-guide.md', content: aptos, date: '2025-04-25' },
  { filename: '03-aave-protocol-guide.md', content: aave, date: '2025-06-08' },
  { filename: '04-aave-versioning-events-data.md', content: aaveVersioning, date: '2025-07-14' },
  { filename: '05-the-graph-protocol-guide.md', content: theGraph, date: '2025-08-30' },
  { filename: '06-compound-protocol-guide.md', content: compound, date: '2025-10-03' },
  { filename: '2026-02-26-consensus-mechanisms.md', content: consensus, date: '2025-11-17' },
  { filename: '2026-02-26-hotstuff-bft-consensus.md', content: hotstuff, date: '2025-12-05' },
  { filename: '07-ethernaut-ctf-writeups.md', content: ethernaut, date: '2025-05-19' },
  { filename: '08-neodym-ctf-defi-exploits.md', content: neodym, date: '2025-07-02' },
  { filename: '09-building-aptos-aave-indexer.md', content: aptosIndexer, date: '2025-09-15' },
  { filename: '10-building-lending-protocol.md', content: lendingProtocol, date: '2025-11-28' },
];

export const blogs: BlogMeta[] = rawFiles.map(({ filename, content, date }) => {
  const slug = makeSlug(filename);

  return {
    slug,
    title: extractTitle(content),
    description: extractDescription(content),
    category: categorize(slug),
    date,
    readTime: estimateReadTime(content),
    content,
  };
});

export function getBlogBySlug(slug: string): BlogMeta | undefined {
  return blogs.find((b) => b.slug === slug);
}
