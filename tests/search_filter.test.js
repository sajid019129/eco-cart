const { Builder, By, until } = require('selenium-webdriver');
const edge = require('selenium-webdriver/edge');

(async function runSearchTest() {
  let options = new edge.Options();
  let driver = await new Builder()
    .forBrowser('MicrosoftEdge')
    .setEdgeOptions(options)
    .build();

  try {
    await driver.get('http://localhost:5173/products');

    const searchInput = await driver.findElement(By.css('input[placeholder*="Search"]'));
    await searchInput.sendKeys('organic');

    const searchButton = await driver.findElement(By.xpath("//button[contains(text(),'Search')]"));
    await searchButton.click();

    await driver.sleep(2000);
    console.log('Search & Filter Selenium Test Executed Successfully');
  } catch (error) {
    console.error('Selenium Test Error:', error);
  } finally {
    await driver.quit();
  }
})();