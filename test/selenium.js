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
  const dashboardUrl = 'chrome-extension://hejmbilhiaajmlpneekhcmfijejiikdg/options.html'
  const popupUrl = 'chrome-extension://hejmbilhiaajmlpneekhcmfijejiikdg/popup.html'

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

  /*after('Quit Webdriver', function () {
    return driver.quit()
  })*/

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
      driver.get(dashboardUrl)
      // turn of CodeMirror since it is not compatible with selenium right now
      driver.executeScript('window.isTesting = true')
      driver.findElement(By.css("a[href='#configuration/create']")).click()
      driver.findElement(By.id('configuration-title')).sendKeys('Selenium Test')
      driver.findElement(By.css('li#current-configuration-editor a')).click()
      driver.findElement(By.id('contentarea')).clear()
      driver.findElement(By.id('contentarea')).sendKeys('demomonkey = testape')
      driver.findElement(By.className('save-button')).click()
      return Promise.all([
        expect(driver.findElement(By.css('.navigation .items')).getText()).to.eventually.include(
          'Selenium Test'),
        expect(driver.findElement(By.id('contentarea')).getText()).to.eventually.include(
          'demomonkey = testape')
      ])
    })

    it('has a popup menu', function () {
      driver.get(popupUrl)
      return expect(driver.findElement(By.id('app')).getAttribute('data-app')).to.eventually.equal(
        'PopupPageApp')
    })

    it('has toggle buttons on the popup menu', function () {
      this.retries(4)
      var button = By.xpath('//*[contains(text(), "Selenium Test")]/../preceding-sibling::div')
      driver.get(popupUrl)
      driver.wait(until.elementsLocated(By.className('toggle-configuration')))
      driver.findElement(button).getText().then(function (text) {
        expect(text).to.include('OFF')
        driver.findElement(button).click()
      })
      return expect(driver.findElement(button).getText()).to.eventually.include('ON')
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
})
