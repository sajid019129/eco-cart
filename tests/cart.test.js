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
    console.log('--- TEST 1: User Login & Session Setup ---');
    await driver.get('http://localhost:5173/login');

    let emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"], input[name="email"]')), 5000);
    let passwordInput = await driver.findElement(By.css('input[type="password"], input[name="password"]'));
    let submitBtn = await driver.findElement(By.css('button[type="submit"]'));

    await emailInput.sendKeys('test@example.com');
    await passwordInput.sendKeys('password123');
    await submitBtn.click();
    await driver.wait(until.urlIs('http://localhost:5173/'), 5000);

    console.log('\n--- TEST 2: Add Item to Cart Flow ---');
    await driver.get('http://localhost:5173/products');

    let addToCartBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Add')]")), 5000);
    await addToCartBtn.click();
    await driver.sleep(1000);
    console.log('✓ Add to cart action executed successfully.');

    console.log('\n--- TEST 3: Cart Page Breakdown & Checkout Simulation ---');
    await driver.get('http://localhost:5173/cart');

    // Wait for the cart page layout to load
    await driver.sleep(1500);

    let checkoutBtn = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(text(), 'Checkout') or contains(text(), 'Place') or contains(text(), 'Order') or contains(text(), 'Proceed')]")),
      5000
    );
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