import selenium from 'selenium-webdriver'
import chai from 'chai'
import base from './base'

const assert = chai.assert
const expect = chai.expect
const By = selenium.By
const until = selenium.until

describe('UI', function () {
  before('Start Webdriver', base.start)
  after('Quit Webdriver', base.quit)

  this.timeout(5000)
  this.retries(4)

  it('has a dashboard', async () => {
    await base.getDriver().get(base.dashboardUrl)
    const title = await base.getDriver().getTitle()
    assert.equal(title, 'Demo Monkey Dashboard')
  })

  it('has a popup menu', async () => {
    await base.getDriver().get(base.popupUrl)
    const dataApp = await base.getDriver().findElement(By.id('app')).getAttribute('data-app')
    assert.equal(dataApp, 'PopupPageApp')
  })

  it('allows to create new configurations', function () {
    return base.createConfig('Selenium Test', 'demomonkey = testape\n@include = /.*/')
  })

  it('allows to enable configurations', function () {
    return base.enableConfig('Selenium Test')
  })

  it('can delete configurations', async function () {
    const driver = base.getDriver()
    await driver.get(base.dashboardUrl)
    await driver.findElement(By.linkText('Example')).click()
    await driver.wait(until.elementsLocated(By.css('button.delete-button')))
    await driver.findElement(By.css('button.delete-button')).click()
    await driver.wait(until.elementsLocated(By.css('button.popup__btn.popup__btn--danger')))
    await driver.findElement(By.css('button.popup__btn.popup__btn--danger')).click()
    const url = await driver.getCurrentUrl()
    expect(url).to.include.string('#help')
    try {
      await driver.findElement(By.linkText('Example'))
      expect.fail('Example was not deleted')
    } catch (e) {
      if (e.name !== 'NoSuchElementError') {
        throw e
      }
    }
  })
})
