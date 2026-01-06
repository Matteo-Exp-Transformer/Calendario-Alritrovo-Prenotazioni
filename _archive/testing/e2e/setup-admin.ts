/**
 * Setup Script: Create Admin User for E2E Tests
 *
 * This script creates a test admin user in Supabase for running E2E tests.
 *
 * Usage: npx tsx e2e/setup-admin.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load env variables from .env.local
function loadEnv() {
  try {
    const envContent = readFileSync('.env.local', 'utf-8');
    const lines = envContent.split('\n');
    const env: Record<string, string> = {};

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=');
        env[key.trim()] = value.trim();
      }
    }

    return env;
  } catch (error) {
    console.error('⚠️ Could not load .env.local');
    return {};
  }
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://dphuttzgdcerexunebct.supabase.co';
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwaHV0dHpnZGNlcmV4dW5lYmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTI0NDMsImV4cCI6MjA3NzA4ODQ0M30.8OpmfjuZkT2vdSbOcr4fUeaKaKibuF4vdFLnNSk7h60';

const TEST_ADMIN = {
  email: 'admin@alritrovo.com',
  password: 'admin123',
  name: 'Admin Test User',
  role: 'admin'
};

async function setupAdminUser() {
  console.log('🚀 Starting admin user setup...\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // Step 1: Sign up the admin user via Supabase Auth
    console.log(`📧 Creating auth user: ${TEST_ADMIN.email}`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: TEST_ADMIN.email,
      password: TEST_ADMIN.password,
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  Auth user already exists');
      } else {
        console.error('❌ Auth error:', authError.message);
        throw authError;
      }
    } else {
      console.log('✅ Auth user created:', authData.user?.id);
    }

    // Step 2: Insert into admin_users table
    console.log('\n📝 Adding user to admin_users table...');

    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .upsert([
        {
          email: TEST_ADMIN.email,
          name: TEST_ADMIN.name,
          role: TEST_ADMIN.role,
        }
      ], {
        onConflict: 'email'
      })
      .select();

    if (adminError) {
      console.error('❌ Database error:', adminError.message);
      throw adminError;
    }

    console.log('✅ Admin user added to database');
    console.log('\n🎉 Admin setup complete!\n');
    console.log('Credentials:');
    console.log(`  Email: ${TEST_ADMIN.email}`);
    console.log(`  Password: ${TEST_ADMIN.password}`);
    console.log('\n✅ You can now run E2E tests');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    console.log('\n📋 Manual Setup Instructions:');
    console.log('1. Go to Supabase Dashboard → Authentication → Users');
    console.log('2. Click "Add User"');
    console.log(`3. Email: ${TEST_ADMIN.email}`);
    console.log(`4. Password: ${TEST_ADMIN.password}`);
    console.log('5. Run this SQL in Supabase SQL Editor:');
    console.log(`
INSERT INTO admin_users (email, name, role)
VALUES ('${TEST_ADMIN.email}', '${TEST_ADMIN.name}', '${TEST_ADMIN.role}')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;
    `);
    process.exit(1);
  }
}

setupAdminUser();
