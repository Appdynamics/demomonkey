import selenium from 'selenium-webdriver'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import base from './base'

const expect = chai.expect
chai.use(chaiAsPromised)
const By = selenium.By
const until = selenium.until

describe('Integration', function () {
  const url = 'https://github.com/Appdynamics/demomonkey'

  before('Start Webdriver', base.start)
  after('Quit Webdriver', base.quit)

  describe('Un-tampered webpage', function () {
    this.timeout(5000)
    it('github page of this project has demomonkey in its title', function () {
      base.getDriver().get(url)
      return expect(base.getDriver().getTitle()).to.eventually.include('demomonkey')
    })
  })

  describe('tampered webpage', function () {
    this.timeout(5000)
    this.retries(4)
    it('allows to create new configurations', function () {
      return base.createConfig('testape', 'demomonkey = testape\n@include = /.*/')
    })
    it('has toggle buttons on the popup menu', function () {
      this.retries(4)
      return base.enableConfig('testape')
    })
    it('github page of this project will have testape in its title', function () {
      base.getDriver().get(url)
      base.getDriver().sleep(1000)
      return expect(base.getDriver().getTitle()).to.eventually.include('testape')
    })
  })

  describe('test page', function () {
    it('will create a test configuration', function () {
      this.timeout(10000)
      return Promise.all([
        base.createConfig('GermanCities', 'San Francisco = Berlin\nSeattle = Köln'),
        base.createConfig('Test Config', '+GermanCities\n@include = /.*/')
      ])
    })

    it('will enable the test configuration', function () {
      this.retries(4)
      return base.enableConfig('Test Config')
    })

    it('will modify the test page', function () {
      this.retries(4)
      this.timeout(5000)
      var driver = base.getDriver()
      driver.get(base.testUrl)
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
