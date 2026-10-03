const { Builder, By, until } = require('selenium-webdriver');
const edge = require('selenium-webdriver/edge');
const assert = require('assert');

(async function runCartAndCheckoutTests() {
  let options = new edge.Options();
  let driver = await new Builder()
    .forBrowser('MicrosoftEdge')
    .setEdgeOptions(options)
    .build();

  try {
    console.log('--- TEST 1: Cart Access & Checkout Flow ---');
    await driver.get('http://localhost:5173/login');

    let emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 5000);
    let passwordInput = await driver.findElement(By.css('input[type="password"]'));
    await emailInput.sendKeys('test@example.com');
    await passwordInput.sendKeys('password123');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.sleep(1000);

    await driver.get('http://localhost:5173/cart');
    await driver.sleep(1500);

    let checkoutBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Checkout') or contains(text(), 'Place') or contains(text(), 'Order')]")), 5000);
    assert.ok(await checkoutBtn.isDisplayed(), 'Checkout button is missing from cart view!');
    await checkoutBtn.click();
    await driver.sleep(1000);

    console.log('✓ Cart rendering and Checkout action verified.');

  } catch (error) {
    console.error('❌ Cart Test Failed:', error.message);
  } finally {
    await driver.quit();
  }
})();