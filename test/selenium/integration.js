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
    this.timeout(10000)
    it('github page of this project has demomonkey in its title', function () {
      base.getDriver().get(url)
      return expect(base.getDriver().getTitle()).to.eventually.include('demomonkey')
    })
  })

  describe('tampered webpage', function () {
    this.timeout(10000)
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
    it('will create a test configurations', function () {
      this.timeout(10000)
      return Promise.all([
        base.createConfig('GermanCities', 'San Francisco = Berlin\nSeattle = Köln\n!replaceUrl(*demomonkey*) = https://github.com/Appdynamics/api-commandline-tool'),
        base.createConfig('Test Config', '+GermanCities\n@include = /.*/'),
        // base.createConfig('AppDynamics Config', '@include = /.*/\n@namespace[] = appdynamics\n!replaceFlowmapIcon(ECommerce-Services) = php\nECommerce = Selenium\n!replace(San Francisco,,,data-label) = Berlin')
        base.createConfig('AppDynamics Config', '@include = /.*/\n@namespace[] = appdynamics\n!replaceFlowmapIcon(ECommerce-Services) = php\nECommerce = Selenium\n!replace(San Francisco,,,data-label) = Berlin')
      ])
    })

    it('will enable the test configurations', function () {
      this.retries(4)
      return Promise.all([
        base.enableConfig('Test Config'),
        base.enableConfig('AppDynamics Config')
      ])
    })

    it('will enable webRequestHook', function () {
      this.retries(4)
      return base.enableOptionalFeature('webRequestHook')
    })

    it('will modify the test page', function () {
      this.retries(4)
      this.timeout(20000)
      var driver = base.getDriver()
      driver.get(base.testUrl)
      driver.findElement(By.id('input')).sendKeys('San Francisco')
      driver.wait(until.elementsLocated(By.id('later')))
      driver.wait(until.elementsLocated(By.css('#APPLICATION_COMPONENT108_3f47 image.adsFlowNodeTypeIcon')))
      return Promise.all([
        expect(driver.findElement(By.id('static')).getText()).to.eventually.include('Berlin'),
        expect(driver.findElement(By.id('later')).getText()).to.eventually.include('Köln'),
        expect(driver.findElement(By.id('ajax')).getText()).to.eventually.include('Command Line Tool'),
        expect(driver.findElement(By.css('#APPLICATION_COMPONENT108_3f47 image.adsFlowNodeTypeIcon')).getAttribute('xlink:href')).to.eventually.include('images/icon_nodetype_php_100x100.png'),
        expect(driver.findElement(By.css('#APPLICATION_COMPONENT108_3f47 > g.adsFlowMapTextContainer > text > tspan.adsFlowMapTextFace')).getText()).to.eventually.include('Selenium'),
        expect(driver.findElement(By.css('[data-label]')).getAttribute('data-label')).to.eventually.include('Berlin')
      ])
    })
  })
})
