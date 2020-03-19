import Stage from '../../src/commands/Stage'
import chai from 'chai'

var assert = chai.assert

// logger needs a global window object
global.window = {
  dmLogger: console.log
}

describe('Stage', function () {
  describe('#apply', function () {
    it('goes from stage to stage', function () {
      const stages = [
        new Stage('start.html', '', 'Start'),
        new Stage('step2.html', '', 'Step2'),
        new Stage('step3.html', '', 'Step3'),
        new Stage('end.html', '', 'End')
      ]
      const document = {
        location: new URL('http://test/start.html'),
        title: ''
      }

      stages.forEach(stage => stage.apply(document, 'key'))

      assert(document['demomonkey-current-stage'], 'Start')

      document.location = new URL('http://test/step2.html')

      stages.forEach(stage => stage.apply(document, 'key'))

      assert(document['demomonkey-current-stage'], 'Step2')

      document.location = new URL('http://test/step3.html')

      stages.forEach(stage => stage.apply(document, 'key'))

      assert(document['demomonkey-current-stage'], 'Step3')

      document.location = new URL('http://test/step4.html')

      stages.forEach(stage => stage.apply(document, 'key'))

      assert(document['demomonkey-current-stage'], 'Step3')

    })
  })
})
