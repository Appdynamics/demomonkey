// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE
/* global define, CodeMirror */

(function (mod) {
  if (typeof exports === 'object' && typeof module === 'object') { // CommonJS
    mod(require('../../node_modules/codemirror/lib/codemirror'))
  } else if (typeof define === 'function' && define.amd) { // AMD
    define(['../../node_modules/lib/codemirror'], mod)
  } else { // Plain browser env
    mod(CodeMirror)
  }
})(function (CodeMirror) {
  'use strict'

  CodeMirror.defineMode('properties', function () {
    return {
      token: function (stream, state) {
        var sol = stream.sol() || state.afterSection
        var eol = stream.eol()

        state.afterSection = false

        if (sol) {
          if (state.nextMultiline) {
            state.inMultiline = true
            state.nextMultiline = false
          } else {
            state.position = 'def'
          }
        }

        if (eol && !state.nextMultiline) {
          state.inMultiline = false
          state.position = 'def'
        }

        if (sol) {
          while (stream.eatSpace()) {}
        }

        var ch = stream.next()

        if (sol && (ch === '#' || ch === ';')) {
          state.position = 'comment'
          stream.skipToEnd()
          return 'comment'
        } else if (ch === '@' && sol) {
          state.position = 'string-2'
          stream.skipToEnd()
          return 'string-2'
        } else if (ch === '!' && sol) {
          state.position = 'keyword'
          state.inCommand = true
          return 'keyword'
        } else if (ch === '(' && state.inCommand) {
          state.position = 'def'
          return 'keyword'
        } else if (ch === ')' && state.inCommand) {
          state.position = 'error'
          return 'keyword'
        } else if (ch === '+' && sol) {
          state.position = 'string'
          stream.skipToEnd()
          return 'string'
        } else if (ch === '$') {
          state.position = 'variable'
          state.inVariable = sol ? 'error' : 'quote'
          return 'variable'
        } else if (ch === ' ' && state.inVariable !== false) {
          state.position = state.inVariable
          return 'variable'
        } else if (sol && ch === '[') {
          state.afterSection = true
          stream.skipTo(']')
          stream.eat(']')
          return 'header'
        } else if (ch === '=') {
          state.position = 'quote'
          state.inCommand = false
          state.inVariable = false
          return null
        } else if (ch === '\\' && state.position === 'quote') {
          if (stream.eol()) { // end of line?
            // Multiline value
            state.nextMultiline = true
          }
        }

        return state.position
      },

      startState: function () {
        return {
          position: 'def', // Current position, "def", "quote" or "comment"
          inCommand: false, // Are we currently in a command definition
          inVariable: false,
          nextMultiline: false, // Is the next line multiline value
          inMultiline: false, // Is the current line a multiline value
          afterSection: false // Did we just open a section
        }
      }

    }
  })

  CodeMirror.defineMIME('text/x-properties', 'properties')
  CodeMirror.defineMIME('text/x-ini', 'properties')
})
