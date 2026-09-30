const { Builder, By, until } = require('selenium-webdriver');
const edge = require('selenium-webdriver/edge');

(async function runTests() {
  let options = new edge.Options();
  let driver = await new Builder()
    .forBrowser('MicrosoftEdge')
    .setEdgeOptions(options)
    .build();

  try {
    await driver.get('http://localhost:5173/login');
    await driver.findElement(By.name('email')).sendKeys('test@example.com');
    await driver.findElement(By.name('password')).sendKeys('password123');
    await driver.findElement(By.css('button[type="submit"]')).click();

    await driver.wait(until.urlIs('http://localhost:5173/'), 5000);
    console.log('Login Test Passed');
  } catch (error) {
    console.error('Test Failed:', error);
  } finally {
    await driver.quit();
  }
})();