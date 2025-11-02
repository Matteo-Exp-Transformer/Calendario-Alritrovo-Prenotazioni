import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function queryMenuItems() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('name, category, price, sort_order')
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error querying menu items:', error);
    process.exit(1);
  }

  console.log('MENU ITEMS IN DATABASE:');
  console.log('================================================================================');
  
  let currentCategory = '';
  data.forEach((item) => {
    if (item.category !== currentCategory) {
      currentCategory = item.category;
      console.log('\n' + currentCategory.toUpperCase());
      console.log('================================================================================');
    }
    const name = item.name.padEnd(50);
    const price = item.price ? item.price.toFixed(2) : 'N/A';
    console.log('  ' + name + ' | EUR ' + price + ' | sort: ' + item.sort_order);
  });
  
  console.log('\n' + '================================================================================');
  console.log('TOTAL ITEMS: ' + data.length);
}

queryMenuItems();
