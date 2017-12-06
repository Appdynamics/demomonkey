import selenium from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

const expect = chai.expect
chai.use(chaiAsPromised)
const By = selenium.By
const until = selenium.until
var driver

describe('Selenium Tests', function () {
  const url = 'https://github.com/svrnm/demomonkey'
  // const extensionID = 'hgegamnnggfbjfpjjalciinpfoghjcnj'
  const extensionID = 'hejmbilhiaajmlpneekhcmfijejiikdg'
  const dashboardUrl = 'chrome-extension://' + extensionID + '/options.html'
  const popupUrl = 'chrome-extension://' + extensionID + '/popup.html'
  const testUrl = 'chrome-extension://' + extensionID + '/test.html'

  function createConfig(driver, title = 'Selenium Test', content = 'demomonkey = testape') {
    driver.get(dashboardUrl)
    driver.findElement(By.css("a[href='#configuration/create']")).click()
    driver.findElement(By.id('configuration-title')).sendKeys(title)
    driver.findElement(By.css('li#current-configuration-editor a')).click()
    driver.findElement(By.css('#contentarea > textarea')).clear()
    driver.findElement(By.css('#contentarea > textarea')).sendKeys(content)
    driver.findElement(By.className('save-button')).click()
    return Promise.all([
      expect(driver.findElement(By.css('.navigation .items')).getText()).to.eventually.include(title),
      expect(driver.findElement(By.id('contentarea')).getText()).to.eventually.include(content)
    ])
  }

  function enableConfig(driver, title = 'Selenium Test') {
    var button = By.xpath('//*[contains(text(), "' + title + '")]/../preceding-sibling::div')
    driver.get(popupUrl)
    driver.wait(until.elementsLocated(By.className('toggle-group')))
    driver.findElement(button).getText().then(function (text) {
      if (text.includes('OFF')) {
        driver.findElement(button).click()
      }
    })
    return expect(driver.findElement(button).getText()).to.eventually.include('ON')
  }

  // Note, that currently the tests depend on each other!
  before('Start Webdriver', function (done) {
    this.timeout(10000)

    var options = new chrome.Options()

    options.addArguments('--load-extension=./build')

    driver = new selenium.Builder().forBrowser('chrome').setChromeOptions(options).build()
    driver.getWindowHandle().then(function () {
      done()
    })
  })

  after('Quit Webdriver', function () {
    return driver.quit()
  })

  describe('Un-tampered webpage', function () {
    this.timeout(5000)
    it('github page of this project has demomonkey in its title', function () {
      driver.get(url)
      return expect(driver.getTitle()).to.eventually.include('demomonkey')
    })
  })

  describe('UI', function () {
    this.timeout(5000)
    it('has a dashboard', function () {
      driver.get(dashboardUrl)
      return expect(driver.getTitle()).to.eventually.equal('Demo Monkey Dashboard')
    })

    it('allows to create new configurations', function () {
      return createConfig(driver, 'Selenium Test', 'demomonkey = testape\n@include = /.*/')
    })

    it('has a popup menu', function () {
      driver.get(popupUrl)
      return expect(driver.findElement(By.id('app')).getAttribute('data-app')).to.eventually.equal(
        'PopupPageApp')
    })

    it('has toggle buttons on the popup menu', function () {
      this.retries(4)
      return enableConfig(driver, 'Selenium Test')
    })
  })

  describe('tampered webpage', function () {
    this.timeout(5000)
    this.retries(4)
    it('github page of this project will have testape in its title', function () {
      driver.get(url)
      driver.sleep(1000)
      return expect(driver.getTitle()).to.eventually.include('testape')
    })
  })

  describe('test page', function () {
    it('will create a test configuration', function () {
      return Promise.all([
        createConfig(driver, 'GermanCities', 'San Francisco = Berlin\nSeattle = Köln'),
        createConfig(driver, 'Test Config', '+GermanCities\n@include = /.*/')
      ])
    })

    it('will enable the test configuration', function () {
      this.retries(4)
      return enableConfig(driver, 'Test Config')
    })

    it('will modify the test page', function () {
      this.retries(4)
      this.timeout(5000)
      driver.get(testUrl)
      driver.findElement(By.id('input')).sendKeys('San Francisco')
      driver.wait(until.elementsLocated(By.id('later')))
      return Promise.all([
        expect(driver.findElement(By.id('input')).getText()).to.eventually.include('Berlin'),
        expect(driver.findElement(By.id('static')).getText()).to.eventually.include('Berlin'),
        expect(driver.findElement(By.id('later')).getText()).to.eventually.include('Köln')
      ])
    })
  })
})
