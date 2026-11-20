import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('MONGODB_URI not set'); process.exit(1); }

async function run() {
  await mongoose.connect(MONGODB_URI);
  const col = mongoose.connection.db.collection('products');

  // Fix diablo base price
  await col.updateOne({ slug: 'diablo-k2-spray-on-paper' }, { $set: { price: 250 } });
  console.log('diablo-k2-spray-on-paper: price -> 250');

  // Report other products whose base price != cheapest variant
  const products = await col.find({ 'priceVariants.0': { $exists: true } }).toArray();
  for (const p of products) {
    const min = Math.min(...p.priceVariants.map(v => v.price));
    if (p.price !== min) console.log(`MISMATCH ${p.slug}: price=${p.price} minVariant=${min}`);
  }
  console.log(`Checked ${products.length} products`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
