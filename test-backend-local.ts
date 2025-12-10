#!/usr/bin/env bun

/**
 * Script de test local du backend
 * Utilisation : bun run test-backend-local.ts
 */

console.log('🧪 Test du backend local\n');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function testHealthCheck() {
  console.log('1️⃣ Test du health check...');
  try {
    const response = await fetch(BASE_URL);
    const data = await response.json();
    
    if (data.status === 'ok') {
      console.log('✅ Health check OK:', data);
    } else {
      console.log('❌ Health check échoué:', data);
    }
  } catch (error) {
    console.log('❌ Erreur lors du health check:', (error as Error).message);
    console.log('💡 Assurez-vous que le serveur est démarré avec: bun run server.ts');
  }
}

async function testTRPC() {
  console.log('\n2️⃣ Test de l\'endpoint tRPC...');
  try {
    const response = await fetch(`${BASE_URL}/api/trpc/example.hi`);
    const data = await response.json();
    
    console.log('✅ tRPC endpoint accessible:', data);
  } catch (error) {
    console.log('❌ Erreur lors du test tRPC:', (error as Error).message);
  }
}

async function runTests() {
  await testHealthCheck();
  await testTRPC();
  
  console.log('\n✨ Tests terminés\n');
}

runTests();
