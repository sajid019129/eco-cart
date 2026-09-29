const { Builder, By, until } = require('selenium-webdriver');

(async function runCartTest() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    // Navigate to the cart view
    await driver.get('http://localhost:5173/cart');

    // Pause briefly to let the cart view render
    await driver.sleep(2000);

    console.log('Cart Selenium Test Executed Successfully');
  } catch (error) {
    console.error('Selenium Test Error:', error);
  } finally {
    await driver.quit();
  }
})();