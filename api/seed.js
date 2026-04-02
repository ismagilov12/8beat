import { kv } from '@vercel/kv';

const DEFAULT_PRODUCTS = [
  {
    id: '1',
    name: 'Chiptune Legend',
    price: 399,
    category: 'Геймер',
    type: 'Футболка',
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 5,
    badge: 'Популярна',
    colors: ['#E52521', '#049CD8'],
  },
  {
    id: '2',
    name: 'Pixel Heart',
    price: 349,
    category: 'Ретро',
    type: 'Футболка',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    rating: 4,
    badge: null,
    colors: ['#FBD000', '#E52521'],
  },
  {
    id: '3',
    name: 'Game Over',
    price: 379,
    category: 'Геймер',
    type: 'Худі',
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 5,
    badge: 'New',
    colors: ['#1a1a2e', '#049CD8'],
  },
  {
    id: '4',
    name: 'Retro Wave',
    price: 449,
    category: 'Ретро',
    type: 'Худі',
    sizes: ['M', 'L', 'XL', 'XXL'],
    rating: 4,
    badge: null,
    colors: ['#FBD000', '#E52521'],
  },
  {
    id: '5',
    name: 'Abstract Pixels',
    price: 329,
    category: 'Абстракт',
    type: 'Футболка',
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 3,
    badge: null,
    colors: ['#049CD8', '#43B047'],
  },
  {
    id: '6',
    name: 'Minimalist Code',
    price: 359,
    category: 'Мінімалізм',
    type: 'Футболка',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    rating: 4,
    badge: null,
    colors: ['#1a1a2e', '#FBD000'],
  },
  {
    id: '7',
    name: 'Boss Level',
    price: 399,
    category: 'Геймер',
    type: 'Футболка',
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 5,
    badge: 'Hot',
    colors: ['#E52521', '#1a1a2e'],
  },
  {
    id: '8',
    name: 'Neon Dreams',
    price: 429,
    category: 'Ретро',
    type: 'Худі',
    sizes: ['M', 'L', 'XL'],
    rating: 4,
    badge: null,
    colors: ['#049CD8', '#FBD000'],
  },
  {
    id: '9',
    name: 'Glitch Master',
    price: 369,
    category: 'Абстракт',
    type: 'Футболка',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    rating: 4,
    badge: null,
    colors: ['#E52521', '#049CD8'],
  },
  {
    id: '10',
    name: 'Clean Code',
    price: 319,
    category: 'Мінімалізм',
    type: 'Футболка',
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 3,
    badge: null,
    colors: ['#1a1a2e', '#43B047'],
  },
  {
    id: '11',
    name: 'Victory Royale',
    price: 459,
    category: 'Геймер',
    type: 'Худі',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    rating: 5,
    badge: 'Лімітовано',
    colors: ['#FBD000', '#049CD8'],
  },
  {
    id: '12',
    name: 'Synth Vibes',
    price: 389,
    category: 'Ретро',
    type: 'Футболка',
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4,
    badge: null,
    colors: ['#E52521', '#FBD000'],
  },
];

function verifyAuth(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  return token === process.env.ADMIN_PASSWORD;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!verifyAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { force } = req.body || {};
    const existing = await kv.get('products');

    if (existing && !force) {
      return res.status(200).json({
        success: false,
        message: 'Products already exist in KV. Use force=true to overwrite.',
      });
    }

    await kv.set('products', DEFAULT_PRODUCTS);

    res.status(200).json({
      success: true,
      message: 'Database seeded with default products',
      count: DEFAULT_PRODUCTS.length,
    });
  } catch (error) {
    console.error('Seed Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
