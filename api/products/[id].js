import { kv } from '@vercel/kv';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function verifyAuth(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  return token === process.env.ADMIN_PASSWORD;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', CORS_HEADERS['Access-Control-Allow-Origin']);
  res.setHeader('Access-Control-Allow-Methods', CORS_HEADERS['Access-Control-Allow-Methods']);
  res.setHeader('Access-Control-Allow-Headers', CORS_HEADERS['Access-Control-Allow-Headers']);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;

  try {
    if (req.method === 'PUT') {
      if (!verifyAuth(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const products = await kv.get('products');
      if (!products) {
        return res.status(404).json({ error: 'Products not found' });
      }

      const productIndex = products.findIndex((p) => p.id === id);
      if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const { name, price, category, type, sizes, rating, badge, colors } = req.body;

      if (!name || !price || !category || !type || !sizes || !rating || !colors) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      products[productIndex] = {
        id,
        name,
        price: parseInt(price, 10),
        category,
        type,
        sizes: Array.isArray(sizes) ? sizes : [sizes],
        rating: parseInt(rating, 10),
        badge: badge || null,
        colors: Array.isArray(colors) ? colors : [colors],
      };

      await kv.set('products', products);
      res.status(200).json(products[productIndex]);
    } else if (req.method === 'DELETE') {
      if (!verifyAuth(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      let products = await kv.get('products');
      if (!products) {
        return res.status(404).json({ error: 'Products not found' });
      }

      const productIndex = products.findIndex((p) => p.id === id);
      if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found' });
      }

      products = products.filter((p) => p.id !== id);
      await kv.set('products', products);

      res.status(200).json({ success: true, message: 'Product deleted' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
