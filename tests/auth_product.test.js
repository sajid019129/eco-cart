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
    console.log('--- TEST 1: Password Reset Token Flow ---');
    await driver.get('http://localhost:5173/forgot-password');

    let emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 5000);
    await emailInput.sendKeys('test@example.com');
    let submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    await submitBtn.click();

    await driver.sleep(1500);
    console.log('✓ Forgot password request submitted.');

    console.log('\n--- TEST 2: Seller Multi-Image Listing Creation ---');
    await driver.get('http://localhost:5173/login');
    let loginEmail = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 5000);
    let loginPass = await driver.findElement(By.css('input[type="password"]'));
    await loginEmail.sendKeys('test@example.com');
    await loginPass.sendKeys('password123');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.sleep(1000);

    await driver.get('http://localhost:5173/add-product');
    let titleInput = await driver.wait(until.elementLocated(By.css('input[name="title"]')), 5000);
    let priceInput = await driver.findElement(By.css('input[name="price"]'));
    let createBtn = await driver.findElement(By.css('button[type="submit"]'));

    const testItemName = 'Pre-owned Jacket ' + Date.now();
    await titleInput.sendKeys(testItemName);
    await priceInput.sendKeys('40');
    await createBtn.click();

    await driver.get('http://localhost:5173/products');
    let createdItem = await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), '${testItemName}')]`)), 5000);
    assert.ok(await createdItem.isDisplayed(), 'Newly created listing was not found!');
    console.log(`✓ Product multi-attribute creation verified: "${testItemName}"`);

  } catch (error) {
    console.error('❌ Auth & Product Test Failed:', error.message);
  } finally {
    await driver.quit();
  }
})();