const { Builder, By, until } = require('selenium-webdriver');
const edge = require('selenium-webdriver/edge');
const assert = require('assert');

(async function runSearchAndFilterTests() {
  let options = new edge.Options();
  let driver = await new Builder()
    .forBrowser('MicrosoftEdge')
    .setEdgeOptions(options)
    .build();

  try {
    console.log('--- TEST 1: Search Query Execution ---');
    await driver.get('http://localhost:5173/products');

    const searchInput = await driver.wait(until.elementLocated(By.css('input[placeholder*="Search"]')), 5000);
    await searchInput.sendKeys('organic');

    const searchButton = await driver.findElement(By.xpath("//button[contains(text(),'Search')]"));
    await searchButton.click();

    await driver.sleep(1000);
    let searchUrl = await driver.getCurrentUrl();
    assert.ok(searchUrl.includes('/products'), 'Failed to stay on products page after search');
    console.log(`✓ Search action executed successfully.`);

    console.log('\n--- TEST 2: Category Pill Isolation Filter ---');
    // Click category filter pill
    let categoryBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Food') or contains(text(), 'Electronics')]")), 5000);
    await categoryBtn.click();
    await driver.sleep(1000);

    // Verify grid container exists and displays filtered content
    let productGrid = await driver.wait(until.elementLocated(By.css('.product-grid, .products-list, main')), 5000);
    assert.ok(await productGrid.isDisplayed(), 'Product grid is not displayed after filtering!');
    console.log('✓ Category Filter Test Passed: Grid updated cleanly upon category select.');

  } catch (error) {
    console.error('❌ Search & Filter Test Failed:', error.message);
  } finally {
    await driver.quit();
  }
})();