import selenium from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome'
import chai from 'chai'

var assert = chai.assert
var By = selenium.By
var until = selenium.until

var driver

var url = 'https://github.com/svrnm/demomonkey'

var dashboardUrl = 'chrome-extension://hejmbilhiaajmlpneekhcmfijejiikdg/options.html'
var popupUrl = 'chrome-extension://hejmbilhiaajmlpneekhcmfijejiikdg/popup.html'

before('Start Webdriver', function (done) {
  this.timeout(10000)

  var options = new chrome.Options()

  options.addArguments('--load-extension=./build')

  driver = new selenium.Builder().forBrowser('chrome').setChromeOptions(options).build()
  driver.getWindowHandle().then(function () {
    done()
  })
})

after('Quit Webdriver', function (done) {
  driver.quit().then(function () {
    done()
  })
})

describe('UI', function () {
  this.timeout(5000)
  it('has a dashboard', function (done) {
    driver.get(dashboardUrl)
    driver.getTitle().then(function (title) {
      assert.equal(title, 'Demo Monkey Dashboard')
      done()
    })
  })
  it('has a popup menu', function (done) {
    driver.get(popupUrl)
    driver.findElement(By.id('app')).then(function (element) {
      element.getAttribute('data-app').then(function (appName) {
        assert.equal(appName, 'PopupPageApp')
        done()
      })
    })
  })
  it('has toggle buttons on the popup menu', function (done) {
    driver.get(popupUrl)
    driver.wait(until.elementsLocated(By.className('toggle-configuration'))).then(function (elements) {
      var element = elements[0]
      element.getText().then(function (text) {
        assert.include(text, 'OFF')
        done()
      })
    })
  })
})

describe('Un-tampered webpage', function () {
  this.timeout(5000)
  it('has demomonkey in its title', function (done) {
    driver.get(url)
    driver.getTitle().then(function (title) {
      assert.include(title, 'demomonkey')
      done()
    })
  })
})

describe('tampered webpage', function () {
  this.timeout(5000)
  this.retries(4)
  it('will have testape in its title', function (done) {
    driver.get(popupUrl)
    driver.wait(until.elementsLocated(By.className('toggle-configuration'))).then(function () {
      driver.findElement(By.xpath('//*[@class="toggle-configuration"]/div[1]/div[1]')).then(function (
        offbutton) {
        offbutton.click().then(function () {
          driver.get(url)
          driver.getTitle().then(function (title) {
            assert.include(title, 'testape')
            done()
          })
        })
      })
    })
  })
})
