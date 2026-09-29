const { Builder, By, until } = require('selenium-webdriver');

(async function runSearchTest() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    // Navigate to the products search view
    await driver.get('http://localhost:5173/products');

    // Locate search input and submit query
    const searchInput = await driver.findElement(By.css('input[placeholder*="Search"]'));
    await searchInput.sendKeys('organic');

    const searchButton = await driver.findElement(By.xpath("//button[contains(text(),'Search')]"));
    await searchButton.click();

    // Pause briefly to let results populate
    await driver.sleep(2000);
    console.log('Search & Filter Selenium Test Executed Successfully');
  } catch (error) {
    console.error('Selenium Test Error:', error);
  } finally {
    await driver.quit();
  }
})();