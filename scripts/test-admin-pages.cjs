const puppeteer = require('puppeteer');

const ADMIN_CREDENTIALS = {
  email: 'admin@monepiceriz.com',
  password: 'admin123'
};

const BASE_URL = 'http://localhost:8000';

const ADMIN_PAGES = [
  { name: 'Dashboard', url: '/admin', selector: 'h1' },
  { name: 'Produits - Liste', url: '/admin/products', selector: 'h1' },
  { name: 'Produits - Création', url: '/admin/products/create', selector: 'h1' },
  { name: 'Catégories - Liste', url: '/admin/categories', selector: 'h1' },
  { name: 'Catégories - Création', url: '/admin/categories/create', selector: 'h1' },
  { name: 'Commandes - Liste', url: '/admin/orders', selector: 'h1' },
  { name: 'Attributs - Liste', url: '/admin/product-attributes', selector: 'h1' },
  { name: 'Attributs - Création', url: '/admin/product-attributes/create', selector: 'h1' },
  { name: 'Démonstration Loading States', url: '/admin/loading-states-demo', selector: 'h1' },
];

async function loginAsAdmin(page) {
  console.log('🔐 Connexion en tant qu\'admin...');
  
  await page.goto(`${BASE_URL}/login`);
  await page.waitForSelector('input[name="email"]');
  
  await page.type('input[name="email"]', ADMIN_CREDENTIALS.email);
  await page.type('input[name="password"]', ADMIN_CREDENTIALS.password);
  
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
  
  console.log('✅ Connexion réussie');
}

async function testPage(page, pageInfo) {
  try {
    console.log(`📄 Test de la page: ${pageInfo.name}`);
    
    await page.goto(`${BASE_URL}${pageInfo.url}`);
    
    // Attendre que la page se charge
    await page.waitForSelector(pageInfo.selector, { timeout: 10000 });
    
    // Vérifier s'il y a des erreurs JavaScript
    const errors = await page.evaluate(() => {
      return window.errors || [];
    });
    
    // Prendre une capture d'écran
    const screenshotPath = `screenshots/admin-${pageInfo.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: true 
    });
    
    // Vérifier le titre de la page
    const title = await page.title();
    const h1Text = await page.$eval('h1', el => el.textContent).catch(() => 'N/A');
    
    console.log(`  ✅ Titre: ${title}`);
    console.log(`  ✅ H1: ${h1Text}`);
    console.log(`  📸 Capture: ${screenshotPath}`);
    
    if (errors.length > 0) {
      console.log(`  ⚠️  Erreurs JS: ${errors.length}`);
    }
    
    return {
      name: pageInfo.name,
      url: pageInfo.url,
      status: 'success',
      title,
      h1Text,
      errors,
      screenshot: screenshotPath
    };
    
  } catch (error) {
    console.log(`  ❌ Erreur: ${error.message}`);
    
    // Capture d'écran de l'erreur
    const errorScreenshot = `screenshots/error-${pageInfo.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    await page.screenshot({ 
      path: errorScreenshot, 
      fullPage: true 
    }).catch(() => {});
    
    return {
      name: pageInfo.name,
      url: pageInfo.url,
      status: 'error',
      error: error.message,
      screenshot: errorScreenshot
    };
  }
}

async function testLoadingStates(page) {
  console.log('🔄 Test des loading states...');
  
  try {
    await page.goto(`${BASE_URL}/admin/loading-states-demo`);
    await page.waitForSelector('h1');
    
    // Tester les boutons de loading
    const buttons = await page.$$('button');
    for (let i = 0; i < Math.min(buttons.length, 3); i++) {
      try {
        await buttons[i].click();
        await page.waitForTimeout(1000);
        console.log(`  ✅ Bouton ${i + 1} testé`);
      } catch (e) {
        console.log(`  ⚠️  Bouton ${i + 1} non cliquable`);
      }
    }
    
    return { status: 'success' };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

async function generateReport(results) {
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  
  console.log('\n📊 RAPPORT DE TEST');
  console.log('='.repeat(50));
  console.log(`✅ Pages fonctionnelles: ${successCount}`);
  console.log(`❌ Pages avec erreurs: ${errorCount}`);
  console.log(`📈 Taux de réussite: ${((successCount / results.length) * 100).toFixed(1)}%`);
  
  if (errorCount > 0) {
    console.log('\n❌ PAGES AVEC ERREURS:');
    results.filter(r => r.status === 'error').forEach(result => {
      console.log(`  - ${result.name}: ${result.error}`);
    });
  }
  
  // Générer un rapport HTML
  const htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <title>Rapport de Test - Dashboard Admin</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: green; }
        .error { color: red; }
        .page-result { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
        .screenshot { max-width: 300px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>Rapport de Test - Dashboard Admin MonEpice&Riz</h1>
    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Pages testées:</strong> ${results.length}</p>
    <p><strong>Succès:</strong> <span class="success">${successCount}</span></p>
    <p><strong>Erreurs:</strong> <span class="error">${errorCount}</span></p>
    
    <h2>Détail des tests</h2>
    ${results.map(result => `
      <div class="page-result">
        <h3 class="${result.status}">${result.name} - ${result.status.toUpperCase()}</h3>
        <p><strong>URL:</strong> ${result.url}</p>
        ${result.title ? `<p><strong>Titre:</strong> ${result.title}</p>` : ''}
        ${result.h1Text ? `<p><strong>H1:</strong> ${result.h1Text}</p>` : ''}
        ${result.error ? `<p class="error"><strong>Erreur:</strong> ${result.error}</p>` : ''}
        ${result.screenshot ? `<img src="${result.screenshot}" alt="Screenshot" class="screenshot">` : ''}
      </div>
    `).join('')}
</body>
</html>`;
  
  require('fs').writeFileSync('admin-test-report.html', htmlReport);
  console.log('\n📄 Rapport HTML généré: admin-test-report.html');
}

async function main() {
  console.log('🚀 Démarrage des tests du dashboard admin...\n');
  
  // Créer le dossier screenshots
  require('fs').mkdirSync('screenshots', { recursive: true });
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 720 }
  });
  
  const page = await browser.newPage();
  
  // Capturer les erreurs JavaScript
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`  🐛 Console Error: ${msg.text()}`);
    }
  });
  
  try {
    // Connexion
    await loginAsAdmin(page);
    
    // Test de toutes les pages
    const results = [];
    for (const pageInfo of ADMIN_PAGES) {
      const result = await testPage(page, pageInfo);
      results.push(result);
      await page.waitForTimeout(1000); // Pause entre les tests
    }
    
    // Test spécial des loading states
    const loadingResult = await testLoadingStates(page);
    console.log(`🔄 Loading states: ${loadingResult.status}`);
    
    // Générer le rapport
    await generateReport(results);
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  } finally {
    await browser.close();
    console.log('\n🏁 Tests terminés');
  }
}

// Vérifier si Puppeteer est installé
try {
  require('puppeteer');
  main().catch(console.error);
} catch (e) {
  console.log('❌ Puppeteer n\'est pas installé.');
  console.log('📦 Installez-le avec: npm install puppeteer');
  console.log('🔄 Ou utilisez: npx puppeteer-core');
} 