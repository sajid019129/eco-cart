const { Builder, By, until } = require('selenium-webdriver');
const edge = require('selenium-webdriver/edge');

(async function runCartTest() {
  let options = new edge.Options();
  let driver = await new Builder()
    .forBrowser('MicrosoftEdge')
    .setEdgeOptions(options)
    .build();

  try {
    await driver.get('http://localhost:5173/cart');
    await driver.sleep(2000);
    console.log('Cart Selenium Test Executed Successfully');
  } catch (error) {
    console.error('Selenium Test Error:', error);
  } finally {
    await driver.quit();
  }
})();