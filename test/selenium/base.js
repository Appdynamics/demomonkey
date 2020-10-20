import selenium from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import fs from 'fs'

// const extensionID = 'hgegamnnggfbjfpjjalciinpfoghjcnj'
const extensionID = 'jppkhbnbdfkchpfplppanilmladmdfbf'

const expect = chai.expect
chai.use(chaiAsPromised)
const By = selenium.By
const until = selenium.until
var driver

const Base = {
  dashboardUrl: 'chrome-extension://' + extensionID + '/options.html',
  popupUrl: 'chrome-extension://' + extensionID + '/popup.html',
  testUrl: 'chrome-extension://' + extensionID + '/test.html',
  getDriver: function () {
    return driver
  },
  start: function (done) {
    this.timeout(10000)
    const options = new chrome.Options()

    // The following is a hack to grant permissions in a testing environment
    // I didn't find a proper way to allow those permissions.
    const rawManifest = fs.readFileSync('./build/manifest.json', 'utf8')
    const manifest = JSON.parse(rawManifest)
    manifest.permissions.push('<all_urls>')
    manifest.permissions.push('webRequest')
    fs.writeFileSync('./build/manifest.json', JSON.stringify(manifest))

    options.addArguments('--load-extension=./build')

    driver = new selenium.Builder().forBrowser('chrome').setChromeOptions(options).build()
    driver.getWindowHandle().then(function () {
      // Revert the manifest file, important!
      fs.writeFileSync('./build/manifest.json', rawManifest)
      done()
    })
  },
  quit: function () {
    return driver.quit()
  },
  enableConfig: function (title = 'Selenium Test') {
    var button = By.xpath('//*[contains(text(), "' + title + '")]/../preceding-sibling::div')
    driver.get(this.popupUrl)
    driver.wait(until.elementsLocated(By.className('toggle-group')))
    driver.findElement(button).getText().then(function (text) {
      if (text.includes('OFF')) {
        driver.findElement(button).click()
      }
    })
    return expect(driver.findElement(button).getText()).to.eventually.include('ON')
  },
  enableOptionalFeature: function (title = 'webRequestHook') {
    driver.get(this.dashboardUrl)
    driver.wait(until.elementsLocated(By.css("a[href='#settings']")))
    driver.findElement(By.css("a[href='#settings']")).click()
    driver.wait(until.elementsLocated(By.className('toggle-group')))
    var button = By.css(`#toggle-${title} > div`)
    driver.findElement(button).click()
    return expect(driver.findElement(button).getText()).to.eventually.include('ON')
  },
  disableOptionalFeature: function (title = 'webRequestHook') {
    driver.get(this.dashboardUrl)
    driver.wait(until.elementsLocated(By.css("a[href='#settings']")))
    driver.findElement(By.css("a[href='#settings']")).click()
    driver.wait(until.elementsLocated(By.className('toggle-group')))
    var button = By.css(`#toggle-${title} > div`)
    driver.findElement(button).click()
    return expect(driver.findElement(button).getText()).to.eventually.include('OFF')
  },
  createConfig: function (title = 'Selenium Test', content = 'demomonkey = testape') {
    driver.get(this.dashboardUrl)
    driver.findElement(By.css("a[href='#configuration/new']")).click()
    driver.findElement(By.id('configuration-title')).sendKeys(title)
    driver.findElement(By.css('li#current-configuration-editor a')).click()
    driver.findElement(By.css('#contentarea > textarea')).clear()
    // Slow down the input, since sometimes not all chars are send
    driver.findElement(By.css('#contentarea > textarea')).sendKeys(';;;;\n')
    driver.findElement(By.css('#contentarea > textarea')).sendKeys(content)
    driver.findElement(By.css('#contentarea > textarea')).sendKeys('\n;;;;')
    driver.findElement(By.className('save-button')).click()
    return Promise.all([
      expect(driver.findElement(By.css('.navigation .items')).getText()).to.eventually.include(title),
      expect(driver.findElement(By.id('contentarea')).getText()).to.eventually.include(content)
    ])
  }
}

export default Base
