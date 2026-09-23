#!/usr/bin/env node
'use strict'

let raw = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (chunk) => {
  raw += chunk
})
process.stdin.on('end', () => {
  let payload
  try {
    payload = JSON.parse(raw)
  } catch {
    respond('ask', 'Orb guard could not parse the shell-hook payload. Review the command manually.')
    return
  }

  const command = typeof payload.command === 'string' ? payload.command.trim() : ''
  if (!command) {
    respond('ask', 'Orb guard received no shell command. Review the operation manually.')
    return
  }

  const normalized = command.replace(/\s+/g, ' ').trim()

  const denyRules = [
    [
      /\b(?:npm|pnpm)\s+(?:publish|unpublish|deprecate)\b/i,
      'Package publication or registry mutation must be performed manually by a human.'
    ],
    [
      /\bgit\s+push\b[^\n;&|]*(?:--force(?:-with-lease)?|\s-f(?:\s|$))/i,
      'Force-pushing is blocked by the Orb Voice agent guard.'
    ],
    [
      /\bgit\s+reset\s+--hard\b/i,
      'Hard resets are blocked because they can destroy uncommitted work.'
    ],
    [
      /\bgit\s+clean\b[^\n;&|]*\s-[a-z]*f[a-z]*d[a-z]*/i,
      'Destructive git clean operations are blocked.'
    ],
    [
      /\bgit\s+(?:commit|push)\b[^\n;&|]*--no-verify\b/i,
      'Bypassing repository Git hooks is blocked.'
    ],
    [
      /\brm\s+-[a-z]*r[a-z]*f[a-z]*\s+(?:\/|~(?:\/|\s|$)|\$HOME(?:\/|\s|$)|"\$HOME(?:\/|"))/i,
      'Recursive removal of root or the home directory is blocked.'
    ],
    [
      /\bRemove-Item\b(?=[^\n]*(?:-Recurse|\/s))(?=[^\n]*(?:-Force|\/q))[^\n]*(?:[A-Za-z]:\\(?:\s|$)|~|\$HOME)/i,
      'Destructive recursive PowerShell removal of a root or home location is blocked.'
    ]
  ]

  for (const [pattern, reason] of denyRules) {
    if (pattern.test(normalized)) {
      respond('deny', reason)
      return
    }
  }

  const asks = [
    [
      /\bgit\s+push\b/i,
      'Git push crosses the local repository boundary and requires human approval.'
    ],
    [
      /\bgit\s+tag\b(?![^\n]*(?:--list|-l)\b)/i,
      'Creating or changing a release tag requires human approval.'
    ],
    [
      /\bgit\s+(?:rebase|merge)\b/i,
      'History integration can alter commit topology and requires human approval.'
    ],
    [
      /\bnpm\s+version\b/i,
      'Version changes are release-boundary operations and require human approval.'
    ],
    [/\bgh\s+pr\s+merge\b/i, 'Merging a pull request requires human approval.']
  ]

  for (const [pattern, reason] of asks) {
    if (pattern.test(normalized)) {
      respond('ask', reason)
      return
    }
  }

  respond('allow')
})

function respond(permission, message) {
  const output = { permission }
  if (message) {
    output.agentMessage = message
    output.userMessage = message
  }
  process.stdout.write(`${JSON.stringify(output)}\n`)
}
