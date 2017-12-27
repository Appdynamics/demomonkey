import selenium from 'selenium-webdriver'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import base from './base'

const expect = chai.expect
chai.use(chaiAsPromised)
const By = selenium.By
const until = selenium.until

describe('UI', function () {
  before('Start Webdriver', base.start)
  after('Quit Webdriver', base.quit)

  this.timeout(5000)
  this.retries(4)

  it('has a dashboard', function () {
    base.getDriver().get(base.dashboardUrl)
    return expect(base.getDriver().getTitle()).to.eventually.equal('Demo Monkey Dashboard')
  })

  it('has a popup menu', function () {
    base.getDriver().get(base.popupUrl)
    return expect(base.getDriver().findElement(By.id('app')).getAttribute('data-app')).to.eventually.equal(
      'PopupPageApp')
  })

  it('allows to create new configurations', function () {
    return base.createConfig('Selenium Test', 'demomonkey = testape\n@include = /.*/')
  })

  it('allows to enable configurations', function () {
    return base.enableConfig('Selenium Test')
  })

  it('can delete configurations', function () {
    var driver = base.getDriver()
    driver.get(base.dashboardUrl)
    driver.findElement(By.linkText('Example')).click()
    driver.wait(until.elementsLocated(By.css('button.delete-button')))
    driver.findElement(By.css('button.delete-button')).click()
    driver.wait(until.elementsLocated(By.css('button.popup__btn.popup__btn--danger')))
    driver.findElement(By.css('button.popup__btn.popup__btn--danger')).click()
    return Promise.all([
      expect(driver.getCurrentUrl()).to.eventually.include('#welcome'),
      expect(driver.findElement(By.linkText('Example'))).to.eventually.be.rejectedWith(selenium.NoSuchElementException)
    ])
  })
})
