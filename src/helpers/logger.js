function logger() {
  const timestamp = Date.now()
  const message = [...arguments]
  const level = message.shift()
  const out = console[['error', 'info', 'warn', 'debug', 'log'].includes(level) ? level : 'log']
  if (window && window.dmLogger) {
    window.dmLogger({
      level,
      // we need to make sure that errors are converted into objects early,
      // since they are not stringified properly. JSON.stringify(new Error()) => {}
      message: message.map(e => {
        if (e instanceof Error) {
          return {
            fromError: true,
            message: e.message,
            name: e.name,
            stack: e.stack
          }
        }
        return e
      }),
      timestamp
    })
  }
  return {
    write: out.bind.apply(out, [console, '[logged]'].concat(message))
  }
}

function connectLogger(store, extras = {}) {
  window.dmLogEntries = []
  // Log messages are written to the store peridocally to avoid lags.
  setInterval(() => {
    if (window.dmLogEntries.length > 0) {
      store.dispatch({
        type: 'APPEND_LOG_ENTRIES',
        entries: window.dmLogEntries
      })
      window.dmLogEntries = []
    }
  }, 2000)
  window.dmLogger = function (entry) {
    // We don't write debug messages to the log
    if (entry.level === 'debug') {
      return
    }
    window.dmLogEntries.push(Object.assign({}, extras, entry))
  }
}

export { logger, connectLogger }
