import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

interface Product {
  id: number;
  name?: string;
  price: number | string;
  category: string | number;
  description?: string;
  inStock: boolean | string;
  tags?: string[] | string;
}

interface DataFile {
  validProducts: Product[];
  invalidProducts: Product[];
}

const dataPath = join(__dirname, 'data', 'products.json');

function loadData(): DataFile {
  const rawData = readFileSync(dataPath, 'utf-8');
  return JSON.parse(rawData) as DataFile;
}

function saveData(data: DataFile): void {
  writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
}

let data = loadData();

const config = {
  delay: 500,
  useInvalidData: true
};

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getNextProductId(): number {
  const allIds = [...data.validProducts, ...data.invalidProducts].map(p => p.id);
  return Math.max(...allIds, 0) + 1;
}

app.get('/api/products', async (req, res) => {
  const delayMs = Number(req.query.delay) || config.delay;
  const includeInvalid = req.query.includeInvalid !== 'false' && config.useInvalidData;

  await delay(delayMs);

  const products = includeInvalid
    ? [...data.validProducts, ...data.invalidProducts]
    : data.validProducts;

  res.json(products);
});

app.get('/api/products/valid', async (req, res) => {
  const delayMs = Number(req.query.delay) || config.delay;
  await delay(delayMs);
  res.json(data.validProducts);
});

app.get('/api/products/invalid', async (req, res) => {
  const delayMs = Number(req.query.delay) || config.delay;
  await delay(delayMs);
  res.json(data.invalidProducts);
});

app.get('/api/products/:id', async (req, res) => {
  const delayMs = Number(req.query.delay) || config.delay;
  await delay(delayMs);

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  const product = data.validProducts.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: `Product with id ${id} not found` });
  }

  res.json(product);
});

app.post('/api/products', async (req, res) => {
  const delayMs = Number(req.query.delay) || config.delay;
  await delay(delayMs);

  const body = req.body;
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Invalid product data' });
  }

  const newProduct: Product = {
    ...body,
    id: getNextProductId()
  };

  data.validProducts.push(newProduct);
  saveData(data);

  res.status(201).json(newProduct);
});

app.put('/api/products/:id', async (req, res) => {
  const delayMs = Number(req.query.delay) || config.delay;
  await delay(delayMs);

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  const index = data.validProducts.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: `Product with id ${id} not found` });
  }

  const body = req.body;
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Invalid product data' });
  }

  const updatedProduct: Product = {
    ...body,
    id
  };

  data.validProducts[index] = updatedProduct;
  saveData(data);

  res.json(updatedProduct);
});

app.delete('/api/products/:id', async (req, res) => {
  const delayMs = Number(req.query.delay) || config.delay;
  await delay(delayMs);

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  const index = data.validProducts.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: `Product with id ${id} not found` });
  }

  data.validProducts = data.validProducts.filter(p => p.id !== id);
  saveData(data);

  res.json({ success: true, message: `Product ${id} deleted successfully` });
});

app.post('/api/config', (req, res) => {
  const { delay: newDelay, useInvalidData } = req.body;
  if (typeof newDelay === 'number') config.delay = newDelay;
  if (typeof useInvalidData === 'boolean') config.useInvalidData = useInvalidData;
  res.json(config);
});

app.get('/api/config', (_req, res) => {
  res.json(config);
});

app.post('/api/reset', async (req, res) => {
  const delayMs = Number(req.query.delay) || config.delay;
  await delay(delayMs);

  const originalData = {
    validProducts: [
      {
        id: 1,
        name: "Wireless Bluetooth Mouse",
        price: 29.99,
        category: "Electronics",
        description: "Ergonomic wireless mouse with Bluetooth connectivity",
        inStock: true,
        tags: ["wireless", "bluetooth", "ergonomic"]
      },
      {
        id: 2,
        name: "USB-C Hub 7-in-1",
        price: 49.99,
        category: "Electronics",
        description: "Multi-port USB-C hub with HDMI, USB 3.0, and card readers",
        inStock: true,
        tags: ["usb-c", "hub", "adapter"]
      },
      {
        id: 3,
        name: "Mechanical Keyboard RGB",
        price: 89.99,
        category: "Electronics",
        description: "Mechanical gaming keyboard with RGB backlighting",
        inStock: false,
        tags: ["keyboard", "mechanical", "rgb", "gaming"]
      }
    ],
    invalidProducts: data.invalidProducts
  };

  data = originalData;
  saveData(data);

  res.json({ success: true, message: 'Store reset to initial state' });
});

app.listen(PORT, () => {
  console.log(`\nMock API server running at http://localhost:${PORT}`);
  console.log(`Data file: ${dataPath}\n`);
  console.log(`Endpoints:`);
  console.log(`  GET    /api/products          - Get all products`);
  console.log(`  GET    /api/products/valid    - Get only valid products`);
  console.log(`  GET    /api/products/invalid  - Get only invalid products`);
  console.log(`  GET    /api/products/:id      - Get product by ID`);
  console.log(`  POST   /api/products          - Create product`);
  console.log(`  PUT    /api/products/:id      - Update product`);
  console.log(`  DELETE /api/products/:id      - Delete product`);
  console.log(`  GET    /api/config            - Get server config`);
  console.log(`  POST   /api/config            - Update server config`);
  console.log(`  POST   /api/reset             - Reset store to initial state\n`);
});
