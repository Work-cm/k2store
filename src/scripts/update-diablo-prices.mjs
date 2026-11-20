import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('MONGODB_URI not set'); process.exit(1); }

const productSchema = new mongoose.Schema({
  name: String, slug: String, category: String,
  description: String,
  priceVariants: [{ quantity: Number, price: Number }],
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// quantity = number of A4 sheets
const LADDER = [
  { quantity: 2, price: 250 },
  { quantity: 3, price: 320 },
  { quantity: 4, price: 420 },
  { quantity: 5, price: 500 },
  { quantity: 10, price: 8200 },
];

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB\n');

  const p = await Product.findOne({ slug: 'diablo-k2-spray-on-paper' });
  if (!p) { console.error('Product not found'); process.exit(1); }

  p.priceVariants = LADDER.map(v => ({ ...v }));
  p.description = p.description.replace(
    'Available in packs of 1, 2, 3, 4, 5 or 10 A4 sheets.',
    'Available in packs of 2, 3, 4, 5 or 10 A4 sheets.'
  );
  await p.save();
  console.log(`${p.slug}: ${p.priceVariants.map(v => `${v.quantity} A4 sheets=€${v.price}`).join(' | ')}`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
