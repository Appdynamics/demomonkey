import SearchAndReplace from '../../src/commands/SearchAndReplace'
import Hide from '../../src/commands/Hide'
import Group from '../../src/commands/Group'
import ReplaceFlowmapIcon from '../../src/commands/appdynamics/ReplaceFlowmapIcon'
import Command from '../../src/commands/Command'
import CommandBuilder from '../../src/commands/CommandBuilder'
import chai from 'chai'

var assert = chai.assert
var expect = chai.expect

describe('Command', function () {
  describe('#_extractForCustomCommand', function () {
    it('should return extracted: false for an empty input', function () {
      assert.deepEqual(new CommandBuilder()._extractForCustomCommand(''), ({ extracted: false }))
    })

    it('should return a command without namespace for a simple string', function () {
      assert.deepEqual(new CommandBuilder()._extractForCustomCommand('cmd'), ({
        extracted: true,
        command: 'cmd',
        namespace: '',
        parameters: []
      }))
    })

    it('should return a command with namespace for a string with a dot', function () {
      assert.deepEqual(new CommandBuilder()._extractForCustomCommand('ns.cmd'), ({
        extracted: true,
        command: 'cmd',
        namespace: 'ns',
        parameters: []
      }))
    })

    it('extracts the command from the string after the last dot', function () {
      assert.deepEqual(new CommandBuilder()._extractForCustomCommand('this.is.a.long.ns.cmd'), ({
        extracted: true,
        command: 'cmd',
        namespace: 'this.is.a.long.ns',
        parameters: []
      }))
    })

    it('extracts a command until the first open (', function () {
      assert.deepEqual(new CommandBuilder()._extractForCustomCommand('ns.cmd()'), ({
        extracted: true,
        command: 'cmd',
        namespace: 'ns',
        parameters: ['']
      }))
    })

    it('should return extracted: false for an command with no closing )', function () {
      assert.deepEqual(new CommandBuilder()._extractForCustomCommand('ns.cmd('), ({ extracted: false }))
    })

    it('extracts everything after the first ( as parameters', function () {
      assert.deepEqual(new CommandBuilder()._extractForCustomCommand('ns.cmd(asdf)'), ({
        extracted: true,
        command: 'cmd',
        namespace: 'ns',
        parameters: ['asdf']
      }))
    })

    it('supports quoting for the parameter', function () {
      assert.deepEqual(new CommandBuilder()._extractForCustomCommand('ns.cmd("asdf")'), ({
        extracted: true,
        command: 'cmd',
        namespace: 'ns',
        parameters: ['asdf']
      }))
    })

    it('extracts and , seperated parameter lists', function () {
      assert.deepEqual(new CommandBuilder()._extractForCustomCommand('ns.cmd(a,s,d,f)'), ({
        extracted: true,
        command: 'cmd',
        namespace: 'ns',
        parameters: ['a', 's', 'd', 'f']
      }))
      assert.deepEqual(new CommandBuilder()._extractForCustomCommand('ns.cmd(a, s,  d ,f)'), ({
        extracted: true,
        command: 'cmd',
        namespace: 'ns',
        parameters: ['a', 's', 'd', 'f']
      }))
    })

    it('supports quoting for parameter lists', function () {
      assert.deepEqual(new CommandBuilder()._extractForCustomCommand(
        'ns.cmd("a,\'s",\' "d \',f,  g, (h), "i\')'),
        ({
          extracted: true,
          command: 'cmd',
          namespace: 'ns',
          parameters: ['a,\'s', ' "d ', 'f', 'g', '(h)', '"i\'']
        }))
    })
  })
  describe('#build', function () {
    it('should create a SearchAndReplace for simple strings', function () {
      expect(new CommandBuilder().build('a', 'b')).to.be.an.instanceof(SearchAndReplace)
    })

    it('should create a SearchAndReplace for regular expression command', function () {
      var command = new CommandBuilder().build('!/a/', 'b')
      expect(command).to.be.an.instanceof(SearchAndReplace)
      expect(command.search).to.be.an.instanceof(RegExp)
    })

    it('should create a SearchAndReplace for regular expression command with standard modifier', function () {
      var command = new CommandBuilder().build('!/a/i', 'b')
      expect(command).to.be.an.instanceof(SearchAndReplace)
      expect(command.search).to.be.an.instanceof(RegExp)
    })

    it('should create a SearchAndReplace for regular expression command with p modifier', function () {
      var command = new CommandBuilder().build('!/TestCase/ip', 'CaseTested')
      expect(command).to.be.an.instanceof(SearchAndReplace)
      expect(command.search).to.be.an.instanceof(RegExp)
      expect(command.replace).to.be.a('function')

      var n1 = {
        value: 'TestCase'
      }

      var n2 = {
        value: 'TESTCASE'
      }

      command.apply(n1, 'value')
      command.apply(n2, 'value')

      assert.equal(n1.value, 'CaseTested')
      assert.equal(n2.value, 'CASETESTED')
    })

    it('should create a SearchAndReplace for a quoted ! at position 0', function () {
      expect(new CommandBuilder().build('\\!a', 'b')).to.be.an.instanceof(SearchAndReplace)
    })

    it('should create a Hide command for !hide("ASDF")', function () {
      expect(new CommandBuilder().build('!hide("ASDF")')).to.be.an.instanceof(Hide)
    })

    it('should create a ReplaceFlowmapIcon command for !appdynamics.replaceFlowmapIcon(Inventory-Service)',
      function () {
        expect(new CommandBuilder().build('!appdynamics.replaceFlowmapIcon(Inventory-Service)', 'php.png')).to
          .be.an.instanceof(ReplaceFlowmapIcon)
      })

    it(
      'should create a ReplaceFlowmapIcon command for !replaceFlowmapIcon(Inventory-Service) and namespaces [appdynamics]',
      function () {
        expect(new CommandBuilder(['appdynamics']).build('!replaceFlowmapIcon(Inventory-Service)', 'php.png'))
          .to.be.an.instanceof(ReplaceFlowmapIcon)
      })

    it(
      'should create a Group command for !hideApplication("ASDF") and namespaces [appdynamics]',
      function () {
        expect(new CommandBuilder(['appdynamics']).build('!hideApplication("ASDF")'))
          .to.be.an.instanceof(Group)
      })

    it('should create a (effect-less) Command for an unknown command', function () {
      var command = new CommandBuilder().build('!unknown', 'b')
      expect(command).to.be.an.instanceof(Command)
    })
  })
})
