import Command from './Command'
import { logger } from '../helpers/logger'

class Stage extends Command {
  constructor(href, title, name) {
    super()
    this.name = name
    this.href = href
    this.title = title
  }

  isApplicableForGroup(group) {
    return group === 'document' || group === '*'
  }

  _match(location, title) {
    return location.href.includes(this.href) && title.includes(this.title)
  }

  apply(target, key = 'value') {
    const currentStage = target['demomonkey-current-stage']
    const currentStageTime = target['demomonkey-current-stage-time']
    if (currentStage !== this.name && this._match(target.location, target.title)) {
      if (typeof currentStage !== 'undefined') {
        const time = Date.now() - currentStageTime
        logger('info', `Transition from stage "${currentStage}" to "${this.name} after ${time}"`)
      } else {
        logger('info', `Starting with stage "${this.name}"`)
      }
      target['demomonkey-current-stage'] = this.name
      target['demomonkey-current-stage-time'] = Date.now()
    }
    return false
  }
}

export default Stage
