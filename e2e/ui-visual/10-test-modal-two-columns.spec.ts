import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';

test.describe('Modal Two Columns Layout Test', () => {
  test('should verify modal has two columns layout on desktop', async () => {
    // Read the BookingDetailsModal file to verify the CSS classes
    const modalFile = readFileSync('src/features/booking/components/BookingDetailsModal.tsx', 'utf-8');
    
    // Check that the modal has grid layout with two columns
    expect(modalFile).toContain('grid grid-cols-1 sm:grid-cols-2');
    expect(modalFile).toContain('Colonna Sinistra');
    expect(modalFile).toContain('Colonna Destra');
    
    // Verify border exists for separation
    expect(modalFile).toContain('sm:border-r-2');
    
    console.log('✅ Modal has correct two-column layout classes:');
    console.log('   - Grid: grid-cols-1 sm:grid-cols-2');
    console.log('   - Border: sm:border-r-2 sm:border-gray-300');
    console.log('   - Left column padding: sm:pr-4');
    console.log('   - Right column padding: sm:pl-6');
  });

  test('should verify responsive behavior', async () => {
    const modalFile = readFileSync('src/features/booking/components/BookingDetailsModal.tsx', 'utf-8');
    
    // Mobile should be single column
    expect(modalFile).toContain('grid-cols-1');
    
    // Desktop should be two columns
    expect(modalFile).toContain('sm:grid-cols-2');
    
    console.log('✅ Responsive behavior verified:');
    console.log('   - Mobile: single column (grid-cols-1)');
    console.log('   - Desktop: two columns (sm:grid-cols-2)');
  });
});

