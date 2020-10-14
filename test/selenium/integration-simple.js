import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import base from './base'

const expect = chai.expect
chai.use(chaiAsPromised)

describe('Integration (Simple)', function () {
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
    // Autocomplete & editing the editor via automation does not work
    it('will disable autoComplete', function () {
      return base.disableOptionalFeature('editorAutocomplete')
    })
    it('allows to create new configurations', function () {
      return base.createConfig('testape', 'demomonkey = testape\n@include = /.*/\n')
    })
    it('has toggle buttons on the popup menu', function () {
      return base.enableConfig('testape')
    })
    it('github page of this project will have testape in its title', function () {
      base.getDriver().get(url)
      base.getDriver().sleep(1000)
      return expect(base.getDriver().getTitle()).to.eventually.include('testape')
    })
  })
})
