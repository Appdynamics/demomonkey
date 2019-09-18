import selenium from 'selenium-webdriver'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import base from './base'

const expect = chai.expect
chai.use(chaiAsPromised)
const By = selenium.By
const until = selenium.until

describe('Integration', function () {
  before('Start Webdriver', base.start)
  after('Quit Webdriver', base.quit)

  this.timeout(20000)
  this.retries(4)

  describe('test page', function () {
    it('will create a test configurations', function () {
      base.getDriver().sleep(500)
      return Promise.all([
        base.createConfig('GermanCities', 'San Francisco = Berlin\nSeattle = Köln'),
        base.createConfig('Test Config', '+GermanCities\n@include = /.*/\n!replaceUrl(*demomonkey*) = https://github.com/Appdynamics/api-commandline-tool'),
        // base.createConfig('AppDynamics Config', '@include = /.*/\n@namespace[] = appdynamics\n!replaceFlowmapIcon(ECommerce-Services) = php\nECommerce = Selenium\n!replace(San Francisco,,,data-label) = Berlin')
        base.createConfig('AppDynamics Config', '@textAttributes[] = data-label,data-another\n@include = /.*/\n@namespace[] = appdynamics\n!replaceFlowmapIcon(ECommerce-Services) = php\nECommerce = Selenium')
      ])
    })

    it('will enable the test configurations', function () {
      return Promise.all([
        base.enableConfig('Test Config'),
        base.enableConfig('AppDynamics Config')
      ])
    })

    it('will enable webRequestHook', function () {
      return base.enableOptionalFeature('webRequestHook')
    })

    it('will modify the test page', function () {
      var driver = base.getDriver()
      driver.get(base.testUrl)
      driver.findElement(By.id('input')).sendKeys('San Francisco')
      driver.wait(until.elementsLocated(By.id('later')))
      driver.wait(until.elementsLocated(By.css('#APPLICATION_COMPONENT108_3f47 image.adsFlowNodeTypeIcon')))
      base.getDriver().sleep(2000)
      return Promise.all([
        expect(driver.findElement(By.id('static')).getText()).to.eventually.include('Berlin'),
        expect(driver.findElement(By.id('later')).getText()).to.eventually.include('Köln'),
        expect(driver.findElement(By.id('ajax')).getText()).to.eventually.include('Command Line Tool'),
        expect(driver.findElement(By.css('#APPLICATION_COMPONENT108_3f47 image.adsFlowNodeTypeIcon')).getAttribute('xlink:href')).to.eventually.include('images/icon_nodetype_php_100x100.png'),
        expect(driver.findElement(By.css('#APPLICATION_COMPONENT108_3f47 > g.adsFlowMapTextContainer > text > tspan.adsFlowMapTextFace')).getText()).to.eventually.include('Selenium'),
        // expect(driver.findElement(By.css('[data-label]')).getAttribute('data-label')).to.eventually.include('Berlin')
      ])
    })
  })
})
