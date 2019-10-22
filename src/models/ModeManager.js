/* global chrome */
import ElementPicker from './ElementPicker'

class ModeManager {
  constructor(scope, monkey, manifest, debugMode = false, debugBox = false, liveMode = false) {
    this.monkey = monkey
    this.scope = scope
    this.manifest = manifest
    this.debugMode = debugMode
    this.debugBox = debugBox
    this.liveMode = liveMode
    this.started = false

    this.avgRunTime = 0
    this.maxRunTime = 0
    this.runCount = 0

    this.monkey.addObserver(this)
  }

  start() {
    this.updateMonkeyHead()
    this.started = true
  }

  reload(monkey, debugMode = false, debugBox = false, liveMode = false) {
    if (this.demoMonkeyPicker) {
      this.demoMonkeyPicker.close()
      delete this.demoMonkeyPicker
    }

    this.clearDebugAttributes()

    this.monkey = monkey
    this.debugMode = debugMode
    this.debugBox = debugBox
    this.liveMode = liveMode

    this.monkey.addObserver(this)

    if (this.started) {
      this.updateMonkeyHead()
    }
  }

  update(event) {
    if (event.type === 'applied') {
      this.updateDebugBox(event.stats.runtime, event.stats.sum, event.stats.undoLength)
    }
    if (event.type === 'addUndo' && this.debugMode) {
      event.elements.forEach(undoElement => {
        if (!undoElement.target) {
          return
        }
        const isHidden = undoElement.key === 'style.display' && undoElement.replacement === 'none' ? undoElement.original : false
        switch (undoElement.target.nodeType) {
          case 1:
            if (undoElement.target && undoElement.target.dataset) {
              this.addDebugAttribute(undoElement.target, isHidden)
            }
            break
          case 3:
            if (undoElement.target && undoElement.target.parentElement && undoElement.target.parentElement.dataset) {
              this.addDebugAttribute(undoElement.target.parentElement, isHidden)
            }
            break
        }
      })
    }
  }

  addDebugAttribute(element, isHidden) {
    // UndoElement(node, 'display.style', original, 'none')
    element.dataset.demoMonkeyDebug = true
    if (isHidden !== false) {
      element.dataset.demoMonkeyDebugDisplay = isHidden === '' ? 'initial' : isHidden
      element.style.setProperty('--data-demo-monkey-debug-display', isHidden === '' ? 'initial' : isHidden)
    }
  }

  clearDebugAttributes() {
    this.scope.document.querySelectorAll('[data-demo-monkey-debug]').forEach((element) => {
      delete element.dataset.demoMonkeyDebug
      delete element.dataset.demoMonkeyDebugDisplay
      element.style.removeProperty('--data-demo-monkey-debug-display')
    })
  }

  removeDebugElements() {
    ['#demo-monkey-debug-helper-svg', '#demo-monkey-debug-helper-style', '#demo-monkey-debug-box'].forEach(id => {
      var elem = this.scope.document.querySelector(id)
      if (elem) {
        elem.remove()
      }
    })
    this.clearDebugAttributes()
  }

  removeEditor() {
    const oldEditor = this.scope.document.getElementById('demo-monkey-editor')
    if (oldEditor) { oldEditor.remove() }
  }

  toggleDebugMode() {
    if (this.debugMode) {
      if (this.scope.document.getElementById('demo-monkey-debug-helper-style') === null) {
        this.scope.document.head.insertAdjacentHTML('beforeend', `<style id="demo-monkey-debug-helper-style">
        [data-demo-monkey-debug] { background-color: rgba(255, 255, 0, 0.5); }
        svg [data-demo-monkey-debug] { filter: url(#dm-debug-filter-visible) }
        [data-demo-monkey-debug-display] { display: var(--data-demo-monkey-debug-display) !important; background-color: rgba(255, 0, 0, 0.5); }
        [data-demo-monkey-debug-display] * { display: var(--data-demo-monkey-debug-display) !important; background-color: rgba(255, 0, 0, 0.5); }
        svg [data-demo-monkey-debug-display] { display: var(--data-demo-monkey-debug-display) !important; filter: url(#dm-debug-filter-hidden) }
        #demo-monkey-debug-box { position: fixed; top: 25px; right: 25px; border: 1px solid black; background: rgb(255,255,255,0.8); z-index: 9999; padding: 15px; pointer-events: none;}
        #demo-monkey-debug-box button { pointer-events: auto; }
        </style>`)
      }
      if (this.scope.document.getElementById('demo-monkey-debug-helper-svg') === null) {
        this.scope.document.body.insertAdjacentHTML('beforeend', `<svg id="demo-monkey-debug-helper-svg">
          <defs>
            <filter x="0" y="0" width="1" height="1" id="dm-debug-filter-visible">
              <feFlood flood-color="yellow" flood-opacity="0.5" />
              <feComposite in="SourceGraphic" />
            </filter>
            <filter x="0" y="0" width="1" height="1" id="dm-debug-filter-hidden">
              <feFlood flood-color="red" flood-opacity="0.5" />
              <feComposite in="SourceGraphic" />
            </filter>
          </defs>
        </svg>`)
      }
      if (this.debugBox && this.scope.document.getElementById('demo-monkey-debug-box') === null) {
        this.scope.document.body.insertAdjacentHTML('beforeend', `<div id="demo-monkey-debug-box">
        Demo Monkey - Debug Box
          <div>Runtime: <span id="demo-monkey-last-runtime"></span></div>
          <div>Inspected Elements: <span id="demo-monkey-elements-count"></span></div>
          <div>Undo Length: <span id="demo-monkey-undo-length"></span></div>
          <button id="demo-monkey-editor-toggle">Toggle Editor</button>
        </div>`)
        this.demoMonkeyPicker = false
        this.scope.document.getElementById('demo-monkey-editor-toggle').addEventListener('click', (e) => {
          const callback = (target, clickEvent, mouseEvent) => {
            this.removeEditor()

            // console.log(target, clickEvent, mouseEvent)

            const container = this.scope.document.createElement('div')
            container.style.position = 'absolute'
            container.id = 'demo-monkey-editor'
            container.style.top = clickEvent.clientY + 'px'
            container.style.left = clickEvent.clientX + 'px'
            container.style['z-index'] = 2147483647

            const apply = (event, search, replacement, command = false) => {
              event.preventDefault()
              this.scope.document.dispatchEvent(new CustomEvent('demomonkey-inline-editing', {
                detail: JSON.stringify({
                  search,
                  replacement,
                  command
                })
              }))
              container.remove()
            }

            const [editor, cb] = (() => {
              // Special handler for flowmap icons
              if (target.classList.contains('adsFlowNodeTypeIcon')) {
                try {
                  const label = target.parentElement.parentElement.querySelector('title').textContent
                  const e = this.scope.document.createElement('select');
                  ['java', '.net', 'php', 'node.js', 'python', 'c++', 'webserver', 'wmb', 'go'].forEach(label => {
                    const o = this.scope.document.createElement('option')
                    o.text = label
                    e.add(o, null)
                  })
                  e.addEventListener('change', (event) => apply(event, label, event.target.value, 'appdynamics.replaceFlowmapIcon'))
                  return [e, false]
                } catch (error) {
                  return [error.getMessage(), () => {}]
                }
              }
              const text = target.textContent.trim()
              const e = this.scope.document.createElement('input')
              e.value = text
              e.size = text.length + 2 > 60 ? 60 : text.length + 2
              e.addEventListener('keyup', function (event) {
                if (event.keyCode === 13) {
                  apply(event, text, e.value)
                }
              })
              return [e, (event) => apply(event, text, e.value)]
            })()

            container.addEventListener('keyup', function (event) {
              if (event.keyCode === 27) {
                container.remove()
              }
            })

            this.scope.document.body.appendChild(container)
            container.appendChild(editor)
            editor.focus()
            clickEvent.preventDefault()

            if (cb !== false) {
              const saveButton = this.scope.document.createElement('button')
              saveButton.innerHTML = 'Save'

              const cancelButton = this.scope.document.createElement('button')
              cancelButton.innerHTML = 'Cancel'

              cancelButton.addEventListener('click', (e) => container.remove())
              saveButton.addEventListener('click', cb)

              container.appendChild(saveButton)
              container.appendChild(cancelButton)
            }
          }

          if (this.demoMonkeyPicker) {
            this.demoMonkeyPicker.close()
            delete this.demoMonkeyPicker
          } else {
            this.demoMonkeyPicker = new ElementPicker({
              action: {
                trigger: 'contextmenu',
                callback
              }
            })
          }
        })
      }
    } else {
      this.removeDebugElements()
    }
  }

  updateMonkeyHead() {
    if (this.monkey.isRunning()) {
      this.scope.document.head.dataset.demoMonkeyVersion = this.manifest.version()
      this.scope.document.head.dataset.demoMonkeyMode = this.debugMode ? 'debug' : (this.liveMode ? 'live' : 'unknown')
      this.toggleDebugMode()
    } else {
      delete this.scope.document.head.dataset.demoMonkeyVersion
      delete this.scope.document.head.dataset.demoMonkeyMode
      this.removeDebugElements()
    }
  }

  updateDebugBox(lastTime, sum, undoLength) {
    if (this.debugBox) {
      var e1 = this.scope.document.getElementById('demo-monkey-last-runtime')
      if (e1) {
        this.runCount++
        this.avgRunTime += (lastTime - this.avgRunTime) / this.runCount
        this.maxRunTime = Math.max(lastTime, this.maxRunTime)
        if (this.runCount % 10 === 0) {
          e1.innerHTML = lastTime.toFixed(2) + ' (avg: ' + this.avgRunTime.toFixed(2) + ', max: ' + this.maxRunTime.toFixed(2) + ', count: ' + this.runCount + ')'
        }
      }
      var e2 = this.scope.document.getElementById('demo-monkey-undo-length')
      if (e2) {
        e2.innerHTML = undoLength
      }
      var e3 = this.scope.document.getElementById('demo-monkey-elements-count')
      if (e3) {
        e3.innerHTML = Object.keys(sum).reduce((acc, key) => {
          return acc.concat(`${key}: ${sum[key]}`)
        }, []).join(', ')
      }
    }
  }
}

export default ModeManager
