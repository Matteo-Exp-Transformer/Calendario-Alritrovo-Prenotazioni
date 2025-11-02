import { test, expect } from '@playwright/test';

/**
 * TEST DATABASE VERIFICATION: Verifica dati prenotazione "Rinfresco di Laurea" nel database
 * 
 * Questo test verifica i dati nel database tramite query SQL usando MCP Supabase.
 * 
 * NOTA: Questo test deve essere eseguito dopo test-rinfresco-laurea-complete.spec.ts
 * e richiede che una prenotazione sia stata già inserita.
 * 
 * Verifica:
 * 1. Presenza record nel database
 * 2. Correttezza booking_type = 'rinfresco_laurea'
 * 3. Correttezza menu_selection (JSONB con items)
 * 4. Correttezza menu_total_per_person (somma prezzi menu items)
 * 5. Correttezza menu_total_booking (menu_total_per_person * num_guests)
 * 6. Correttezza dietary_restrictions (se presenti)
 * 7. Presenza tutti i campi richiesti
 */

test.describe('Test Database Verification: Rinfresco di Laurea', () => {
  const testEmail = 'mario.rossi.test@example.com';
  let expectedMenuTotalPerPerson = 0;
  let expectedMenuTotalBooking = 0;
  let expectedNumGuests = 25;

  test('Verifica dati nel database tramite query SQL', async () => {
    console.log('🧪 TEST DATABASE: Verifica dati nel database...');
    console.log('📋 Questo test richiede MCP Supabase - eseguire manualmente con query SQL');
    
    // Calcola valori attesi (basati sul test precedente)
    expectedMenuTotalPerPerson = 40.00; // Caraffe/Drink 5 + Pizza 8 + Primo 12 + Secondo 15
    expectedMenuTotalBooking = expectedMenuTotalPerPerson * expectedNumGuests;

    console.log('\n📊 VALORI ATTESI:');
    console.log(`- Client Email: ${testEmail}`);
    console.log(`- Booking Type: rinfresco_laurea`);
    console.log(`- Num Guests: ${expectedNumGuests}`);
    console.log(`- Menu Total Per Person: €${expectedMenuTotalPerPerson.toFixed(2)}`);
    console.log(`- Menu Total Booking: €${expectedMenuTotalBooking.toFixed(2)}`);
    
    console.log('\n🔍 QUERY SQL DA ESEGUIRE:');
    console.log(`
SELECT 
  id,
  client_name,
  client_email,
  client_phone,
  booking_type,
  desired_date,
  desired_time,
  num_guests,
  menu_selection,
  menu_total_per_person,
  menu_total_booking,
  dietary_restrictions,
  special_requests,
  status,
  created_at
FROM booking_requests
WHERE client_email = '${testEmail}'
  AND booking_type = 'rinfresco_laurea'
ORDER BY created_at DESC
LIMIT 1;
    `);

    console.log('\n✅ VERIFICHE DA ESEGUIRE:');
    console.log('1. ✅ booking_type = \'rinfresco_laurea\'');
    console.log('2. ✅ num_guests = ' + expectedNumGuests);
    console.log('3. ✅ menu_selection IS NOT NULL');
    console.log('4. ✅ menu_selection->\'items\' è un array con almeno 4 elementi');
    console.log('5. ✅ menu_total_per_person = ' + expectedMenuTotalPerPerson.toFixed(2));
    console.log('6. ✅ menu_total_booking = ' + expectedMenuTotalBooking.toFixed(2));
    console.log('7. ✅ menu_total_booking = menu_total_per_person * num_guests');
    console.log('8. ✅ dietary_restrictions contiene almeno 2 restrizioni');
    
    console.log('\n📝 QUERY DETTAGLIATA PER VERIFICA CALCOLI:');
    console.log(`
-- Verifica calcolo prezzi
SELECT 
  id,
  client_name,
  num_guests,
  menu_total_per_person,
  menu_total_booking,
  -- Calcolo atteso
  menu_total_per_person * num_guests as calculated_total,
  -- Verifica
  CASE 
    WHEN menu_total_booking = (menu_total_per_person * num_guests) THEN '✅ CORRETTO'
    ELSE '❌ ERRORE'
  END as price_verification,
  -- Menu items
  jsonb_array_length(menu_selection->'items') as num_menu_items,
  menu_selection->'items' as menu_items
FROM booking_requests
WHERE client_email = '${testEmail}'
  AND booking_type = 'rinfresco_laurea'
ORDER BY created_at DESC
LIMIT 1;
    `);

    console.log('\n📋 QUERY PER VERIFICA MENU SELECTION:');
    console.log(`
-- Verifica struttura menu_selection
SELECT 
  id,
  menu_selection,
  jsonb_pretty(menu_selection) as menu_selection_formatted,
  -- Estrai items
  menu_selection->'items' as items_array,
  -- Conta items
  jsonb_array_length(menu_selection->'items') as items_count,
  -- Somma prezzi manualmente
  (
    SELECT SUM((item->>'price')::numeric)
    FROM jsonb_array_elements(menu_selection->'items') as item
  ) as manual_price_sum
FROM booking_requests
WHERE client_email = '${testEmail}'
  AND booking_type = 'rinfresco_laurea'
ORDER BY created_at DESC
LIMIT 1;
    `);

    // Questo test non esegue query reali, solo documenta cosa verificare
    // Le query devono essere eseguite manualmente tramite MCP Supabase
    test.skip(); // Skip automatico - da eseguire manualmente con MCP
  });

  test('Schema di verifica automatica (placeholder per integrazione MCP)', async () => {
    console.log('🔧 Questo test è un placeholder per futura integrazione MCP Supabase diretta');
    console.log('📝 Per ora, eseguire le query manualmente usando MCP Supabase tools');
    
    // Placeholder per futuro
    // const booking = await mcp_supabase_execute_sql({ query: `SELECT ...` });
    // expect(booking.booking_type).toBe('rinfresco_laurea');
    // expect(booking.menu_total_per_person).toBe(expectedMenuTotalPerPerson);
    // expect(booking.menu_total_booking).toBe(expectedMenuTotalBooking);
    
    test.skip();
  });
});



