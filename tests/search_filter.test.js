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
    console.log('--- TEST 1: Clothes Category Filter Selection ---');
    await driver.get('http://localhost:5173/products');

    let clothesCategoryBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Clothes')]")), 5000);
    await clothesCategoryBtn.click();
    await driver.sleep(1000);

    let productGrid = await driver.wait(until.elementLocated(By.css('.product-grid')), 5000);
    assert.ok(await productGrid.isDisplayed(), 'Product grid is not displayed after selecting Clothes category!');
    console.log('✓ Clothes category filter executed successfully.');

  } catch (error) {
    console.error('❌ Search & Filter Test Failed:', error.message);
  } finally {
    await driver.quit();
  }
})();