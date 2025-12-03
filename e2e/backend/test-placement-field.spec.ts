import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * TDD Test for Placement Field Implementation - BACKEND ONLY
 *
 * RED Phase: This test should FAIL initially because:
 * - Column 'placement' doesn't exist in booking_requests table
 *
 * GREEN Phase: After migration, test should PASS
 *
 * This test focuses ONLY on backend database schema.
 * UI integration is tested separately.
 */

// Initialize Supabase client for direct database operations
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dphuttzgdcerexunebct.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

test.describe('Backend: Placement Field Implementation (TDD)', () => {
  let testBookingId: string | null = null;

  test.afterEach(async () => {
    // Cleanup: delete test booking
    if (testBookingId) {
      console.log(`🧹 Cleaning up test booking: ${testBookingId}`);
      await supabase
        .from('booking_requests')
        .delete()
        .eq('id', testBookingId);
      testBookingId = null;
    }
  });

  test('RED -> GREEN: Placement column should exist and accept values', async () => {
    console.log('');
    console.log('🧪 TEST: Placement field in booking_requests table');
    console.log('🔴 RED Phase: This test should FAIL if column doesn\'t exist');
    console.log('');

    // Step 1: Create a minimal test booking WITH placement field
    console.log('📝 Creating test booking with placement="Sala A"...');

    const testEmail = `placement-backend-test-${Date.now()}@example.com`;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];

    const testBooking = {
      client_name: 'Backend Test Placement',
      client_email: testEmail,
      client_phone: '3331234567',
      booking_type: 'tavolo',
      desired_date: dateString,
      desired_time: '19:00',
      num_guests: 4,
      status: 'pending',
      placement: 'Sala A' // THIS IS THE KEY FIELD
    };

    // Attempt to insert with placement field
    const { data: insertedBooking, error: insertError } = await supabase
      .from('booking_requests')
      .insert(testBooking)
      .select()
      .single();

    if (insertError) {
      console.error('');
      console.error('========================================');
      console.error('🔴 RED PHASE: Insert FAILED (EXPECTED)');
      console.error('Error:', insertError.message);
      console.error('');
      console.error('This is expected because placement column does not exist yet.');
      console.error('');
      console.error('Next steps to reach GREEN:');
      console.error('  1. Create migration: 033_add_placement_field.sql');
      console.error('  2. Run: npx supabase db push');
      console.error('  3. Re-run this test');
      console.error('========================================');
      console.error('');

      // The test SHOULD fail here in RED phase
      expect(insertError).toBeNull(); // This will fail, proving RED works
      return;
    }

    // If we get here, we're in GREEN phase
    console.log('✅ Booking inserted successfully');
    testBookingId = insertedBooking.id;

    console.log('✅ Booking created with ID:', insertedBooking.id);
    console.log('✅ Placement value:', insertedBooking.placement);

    // Step 2: Verify placement field exists in returned data
    console.log('');
    console.log('🔍 Verifying placement field in database...');

    expect(insertedBooking).toHaveProperty('placement');
    expect(insertedBooking.placement).toBe('Sala A');

    console.log('✅ Placement field exists and has correct value');

    // Step 3: Fetch the booking back and verify placement persisted
    console.log('');
    console.log('🔍 Fetching booking back from database...');

    const { data: fetchedBooking, error: fetchError } = await supabase
      .from('booking_requests')
      .select('*')
      .eq('id', insertedBooking.id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch booking: ${fetchError.message}`);
    }

    console.log('✅ Booking fetched successfully');
    console.log('✅ Placement value after fetch:', fetchedBooking.placement);

    expect(fetchedBooking).toHaveProperty('placement');
    expect(fetchedBooking.placement).toBe('Sala A');

    // Step 4: Test updating placement field
    console.log('');
    console.log('🔄 Testing placement field update...');

    const { data: updatedBooking, error: updateError } = await supabase
      .from('booking_requests')
      .update({ placement: 'Sala B' })
      .eq('id', insertedBooking.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update placement: ${updateError.message}`);
    }

    console.log('✅ Placement updated successfully');
    console.log('✅ New placement value:', updatedBooking.placement);

    expect(updatedBooking.placement).toBe('Sala B');

    // Step 5: Test null placement (optional field)
    console.log('');
    console.log('🔄 Testing null placement (optional field)...');

    const { data: nullPlacement, error: nullError } = await supabase
      .from('booking_requests')
      .update({ placement: null })
      .eq('id', insertedBooking.id)
      .select()
      .single();

    if (nullError) {
      throw new Error(`Failed to set placement to null: ${nullError.message}`);
    }

    console.log('✅ Placement can be null (optional field)');
    console.log('✅ Placement value:', nullPlacement.placement);

    expect(nullPlacement.placement).toBeNull();

    // Step 6: Test all valid placement values
    console.log('');
    console.log('🎯 Testing all valid placement values...');

    const validPlacements = ['Sala A', 'Sala B', 'Deorr'];

    for (const placement of validPlacements) {
      const { data, error } = await supabase
        .from('booking_requests')
        .update({ placement })
        .eq('id', insertedBooking.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to set placement to "${placement}": ${error.message}`);
      }

      expect(data.placement).toBe(placement);
      console.log(`✅ Valid placement: "${placement}"`);
    }

    console.log('');
    console.log('=========================================');
    console.log('🟢 GREEN PHASE: ALL TESTS PASSED');
    console.log('');
    console.log('Verified behaviors:');
    console.log('  ✅ Placement column exists in booking_requests');
    console.log('  ✅ Placement accepts string values');
    console.log('  ✅ Placement can be null (optional)');
    console.log('  ✅ Placement can be updated');
    console.log('  ✅ All valid values work: Sala A, Sala B, Deorr');
    console.log('=========================================');
    console.log('');
  });
});
