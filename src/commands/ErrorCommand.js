import Command from './Command'

class ErrorCommand extends Command {
  constructor(reason, type = 'error') {
    super()
    this.reason = reason
    this.type = type
  }

  isApplicableForGroup() {
    return false
  }

  apply() {
    return false
  }
}

export default ErrorCommand
