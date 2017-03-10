import SearchAndReplace from '../../src/commands/SearchAndReplace'
import ReplaceFlowmapIcon from '../../src/commands/appdynamics/ReplaceFlowmapIcon'
import Command from '../../src/commands/Command'
import CommandBuilder from '../../src/commands/CommandBuilder'
import chai from 'chai'

var assert = chai.assert
var expect = chai.expect

describe('Command', function () {
  describe('#build', function () {
    it('should create a SearchAndReplace for simple strings', function () {
      expect(new CommandBuilder().build('a', 'b')).to.be.an.instanceof(SearchAndReplace)
    })

    it('should create a SearchAndReplace for regular expression command', function () {
      var command = new CommandBuilder().build('!/a/i', 'b')
      expect(command).to.be.an.instanceof(SearchAndReplace)
      expect(command.search).to.be.an.instanceof(RegExp)
    })

    it('should create a SearchAndReplace for regular expression command with p modifier', function () {
      var command = new CommandBuilder().build('!/TestCase/ip', 'CaseTested')
      expect(command).to.be.an.instanceof(SearchAndReplace)
      expect(command.search).to.be.an.instanceof(RegExp)
      expect(command.replace).to.be.a('function')

      assert.equal(command.apply('TestCase'), 'CaseTested')
      assert.equal(command.apply('TESTCASE'), 'CASETESTED')
    })

    it('should create a SearchAndReplace for a quoted ! at position 0', function () {
      expect(new CommandBuilder().build('\\!a', 'b')).to.be.an.instanceof(SearchAndReplace)
    })

    it('should create a ReplaceFlowmapIcon command for !appdynamics.replaceFlowmapIcon(Inventory-Service)', function () {
      expect(new CommandBuilder().build('!appdynamics.replaceFlowmapIcon(Inventory-Service)', 'php.png')).to.be.an.instanceof(ReplaceFlowmapIcon)
    })

    it('should create a ReplaceFlowmapIcon command for !replaceFlowmapIcon(Inventory-Service) and namespaces [appdynamics]', function () {
      expect(new CommandBuilder(['appdynamics']).build('!replaceFlowmapIcon(Inventory-Service)', 'php.png')).to.be.an.instanceof(ReplaceFlowmapIcon)
    })

    it('should create a (effect-less) Command for an unknown command', function () {
      var command = new CommandBuilder().build('!unknown', 'b')
      expect(command).to.be.an.instanceof(Command)
    })
  })
})
