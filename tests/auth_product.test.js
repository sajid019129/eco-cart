const { Builder, By, until } = require('selenium-webdriver');
const edge = require('selenium-webdriver/edge');
const assert = require('assert');

(async function runAuthAndProductTests() {
  let options = new edge.Options();
  let driver = await new Builder()
    .forBrowser('MicrosoftEdge')
    .setEdgeOptions(options)
    .build();

  try {
    console.log('--- TEST 1: User Login & Session Verification ---');
    await driver.get('http://localhost:5173/login');

    let emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"], input[name="email"]')), 5000);
    let passwordInput = await driver.findElement(By.css('input[type="password"], input[name="password"]'));
    let submitBtn = await driver.findElement(By.css('button[type="submit"]'));

    await emailInput.sendKeys('test@example.com');
    await passwordInput.sendKeys('password123');
    await submitBtn.click();

    // Strict Assertion: URL redirect
    await driver.wait(until.urlIs('http://localhost:5173/'), 5000);
    let currentUrl = await driver.getCurrentUrl();
    assert.strictEqual(currentUrl, 'http://localhost:5173/', 'Login failed to redirect to home page!');
    console.log('✓ Login successful and redirected to home page.');

    console.log('\n--- TEST 2: Add Seller Product Flow ---');
    await driver.get('http://localhost:5173/add-product');

    let titleInput = await driver.wait(until.elementLocated(By.css('input[name="title"], input[placeholder*="Title"]')), 5000);
    let priceInput = await driver.findElement(By.css('input[type="number"], input[name="price"]'));
    let categorySelect = await driver.findElement(By.css('select'));
    let createBtn = await driver.findElement(By.css('button[type="submit"]'));

    const testItemName = 'Selenium Eco Bottle ' + Date.now();
    await titleInput.sendKeys(testItemName);
    await priceInput.sendKeys('25');
    await categorySelect.sendKeys('Electronics');
    await createBtn.click();

    // Verify creation by checking catalog redirect or toast message
    await driver.get('http://localhost:5173/products');
    let createdItem = await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), '${testItemName}')]`)), 5000);
    let isDisplayed = await createdItem.isDisplayed();
    assert.ok(isDisplayed, 'Newly created product was not found in product catalog!');
    console.log(`✓ Product creation verified in DOM: "${testItemName}"`);

  } catch (error) {
    console.error('❌ Auth & Product Test Failed:', error.message);
  } finally {
    await driver.quit();
  }
})();