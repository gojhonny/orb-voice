#!/bin/sh
set -eu

ROOT=$(CDPATH= cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"

orb_tmp=$(mktemp -d "${TMPDIR:-/tmp}/orbo-ownership-audit.XXXXXX")
trap 'rm -rf "$orb_tmp"' 0 1 2 15

node - "$ROOT" "$orb_tmp" <<'NODE'
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { execFileSync, spawnSync } = require('node:child_process')
const [root, temporary] = process.argv.slice(2)
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const pkg = JSON.parse(read('package.json'))
const pass = (message) => console.log(`PASS  ${message}`)

try {
  assert.equal(pkg.name, 'orbo-voice', 'package must preserve the published npm identity')
  assert.equal(pkg.author, 'gojhonny', 'author must use the owner handle without an invented email')
  assert.equal(pkg.repository?.url, 'git+https://github.com/gojhonny/orbo.git')
  assert.equal(pkg.bugs?.url, 'https://github.com/gojhonny/orbo/issues')
  assert.equal(pkg.homepage, 'https://neongate.com.br/docs/orbz/overview')
  assert.match(read('LICENSE'), /Copyright \(c\) 2026 gojhonny/)
  pass('npm identity is preserved while GitHub metadata and license identify gojhonny')

  const release = read('.github/workflows/release.yml')
  for (const token of [
    "github.repository == 'gojhonny/orbo' && github.ref == 'refs/heads/main'",
    "name !== 'orbo-voice'",
    'orbo-voice-${version}.tgz',
    'https://registry.npmjs.org/orbo-voice/',
    'npm view "orbo-voice@$RELEASE_VERSION" dist.integrity',
    'npm exec --yes --package="orbo-voice@$RELEASE_VERSION" -- orbo --help'
  ]) {
    assert.ok(release.includes(token), `release identity is missing: ${token}`)
  }
  pass('release owner guard, tarball, registry and public binary use the same package')

  // Include new files before staging; keep superseded decisions as historical evidence.
  // Historical SPECs/ADRs may name OrbZ. Current-state files must not.
  const abandonedNpmName = '@' + 'gojhonny/' + 'orbz'
  const stalePublishedName = '@' + 'neongate-ai/' + 'orbz'
  const staleGithubRepo = 'gojhonny/' + 'orbz'
  const abandonedDistributionName = 'orb' + 'v'
  const retiredPackageName = 'orb' + '-voice'
  const retiredProductName = 'Orb' + ' Voice'
  const retiredOrbuName = 'orb' + 'u'
  const retiredOrbuElement = 'orb' + '-u'
  const staleGithubOwner = /(?:github\.com[/:]|githubusercontent\.com\/|github\/actions\/workflow\/status\/)neongate(?:-ai)?\//i
  const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
    cwd: root, encoding: 'utf8'
  }).split('\0').filter(Boolean)
  for (const file of new Set(files)) {
    if (file.startsWith('.agents/specs/') || file.startsWith('.agents/adrs/')) continue
    if (file === '.agents/rules/001-package-contract.rule.md') continue
    const absolute = path.join(root, file)
    if (!fs.existsSync(absolute)) continue
    if (!fs.lstatSync(absolute).isFile()) continue
    const contents = fs.readFileSync(absolute)
    if (contents.includes(0)) continue
    const text = contents.toString('utf8')
    assert.ok(!staleGithubOwner.test(text), `obsolete GitHub ownership remains in active text: ${file}`)
    assert.ok(!text.includes(abandonedNpmName), `abandoned npm identity remains in active text: ${file}`)
    assert.ok(!text.includes(stalePublishedName), `previous npm identity remains in active text: ${file}`)
    assert.ok(!text.includes(staleGithubRepo), `previous GitHub identity remains in active text: ${file}`)
    assert.ok(!text.includes(abandonedDistributionName), `abandoned distribution name remains in active text: ${file}`)
    assert.ok(!text.includes(retiredPackageName), `retired package name remains in active text: ${file}`)
    assert.ok(!text.includes(retiredProductName), `retired product name remains in active text: ${file}`)
    assert.ok(!text.includes(retiredOrbuName), `retired unscoped rename remains in active text: ${file}`)
    assert.ok(!text.includes(retiredOrbuElement), `retired element rename remains in active text: ${file}`)
  }
  pass('active text uses Orbo identity and rejects obsolete GitHub ownership and retired npm names')

  const appearance = JSON.parse(read('src/orbo.config.json')).appearance
  assert.equal(appearance.defaultPreset, 'neongate')
  assert.deepEqual(appearance.presetNames,
    ['neongate', 'periwinkle', 'magenta', 'peach', 'mocha', 'ivory'])
  assert.deepEqual(Object.keys(appearance.presets), appearance.presetNames)
  assert.deepEqual(appearance.presets.neongate, {
    accent: '#FF4DDE', background: '#14142B', highlight: '#FFB07A',
    primary: '#6C5CFF', secondary: '#00E9FF'
  })
  assert.ok(!read('README.md').includes('preset="gojhonny"'))
  assert.ok(!read('README.md').includes('| `gojhonny` |'))
  pass('NeonGate branding, canonical palette names and established colors remain independent of GitHub ownership')

  const packageDirectory = path.join(temporary, 'package')
  const consumer = path.join(temporary, 'consumer project')
  const fixtureBin = path.join(temporary, 'bin')
  fs.mkdirSync(packageDirectory)
  fs.mkdirSync(consumer)
  fs.mkdirSync(fixtureBin)
  fs.cpSync(path.join(root, 'cli'), path.join(packageDirectory, 'cli'), { recursive: true })
  fs.copyFileSync(path.join(root, 'package.json'), path.join(packageDirectory, 'package.json'))
  const cli = path.join(packageDirectory, 'cli/orbo')
  const manifest = path.join(consumer, 'package.json')
  const source = path.join(consumer, 'app.js')
  fs.writeFileSync(source, 'export const existingApplication = true\n')
  const initial = { name: 'orbo-ownership-consumer', private: true }
  const reset = () => fs.writeFileSync(manifest, JSON.stringify(initial))
  const env = { ...process.env, PATH: `${fixtureBin}${path.delimiter}${process.env.PATH}`,
    ORB_PACKAGE_SPEC: '', ORB_FIXTURE_SKIP_WRITE: '0', ORB_FIXTURE_VERSION: pkg.version }

  // Simulate only the dependency write; no registry or network is involved.
  const npm = path.join(fixtureBin, 'npm')
  fs.writeFileSync(npm, `#!/bin/sh
set -eu
[ "$#" -eq 3 ] && [ "$1" = install ] && [ "$2" = --save ]
[ "$3" = "orbo-voice@$ORB_FIXTURE_VERSION" ]
[ "\${ORB_FIXTURE_SKIP_WRITE:-0}" != 1 ] || exit 0
node <<'FIXTURE'
const fs = require('node:fs')
const data = JSON.parse(fs.readFileSync('package.json', 'utf8'))
data.dependencies = { ...data.dependencies, 'orbo-voice': process.env.ORB_FIXTURE_VERSION }
fs.writeFileSync('package.json', JSON.stringify(data))
FIXTURE
`)
  fs.chmodSync(npm, 0o755)
  const run = (args, options = {}) => spawnSync(cli, args, {
    cwd: consumer, env, encoding: 'utf8', ...options
  })
  reset()
  const installed = run(['--package-manager', 'npm'])
  assert.equal(installed.status, 0, installed.stderr)
  assert.equal(JSON.parse(fs.readFileSync(manifest, 'utf8')).dependencies?.[pkg.name], pkg.version)
  assert.ok(installed.stdout.includes("import 'orbo-voice/browser'"))
  assert.ok(installed.stdout.includes('preset="neongate"'))
  assert.equal(fs.readFileSync(source, 'utf8'), 'export const existingApplication = true\n')
  assert.deepEqual(fs.readdirSync(consumer).sort(), ['app.js', 'package.json'])
  pass('published setup installs the existing npm package at its own version and preserves consumer source')

  const existing = { ...initial, dependencies: { [pkg.name]: '^0.4.0' } }
  const existingManifest = JSON.stringify(existing)
  fs.writeFileSync(manifest, existingManifest)
  const repeated = run(['--package-manager', 'npm'])
  assert.equal(repeated.status, 0, repeated.stderr)
  assert.equal(fs.readFileSync(manifest, 'utf8'), existingManifest)
  assert.ok(repeated.stdout.includes(`${pkg.name} is already a project dependency`))
  assert.equal(fs.readFileSync(source, 'utf8'), 'export const existingApplication = true\n')
  pass('existing published-package dependency is preserved without a reinstall or source changes')

  reset()
  const noWrite = run(['--package-manager', 'npm'], {
    env: { ...env, ORB_FIXTURE_SKIP_WRITE: '1' }
  })
  assert.equal(noWrite.status, 1, 'setup must reject a manager that did not add the new dependency')
  assert.ok(noWrite.stderr.includes('without adding orbo-voice to dependencies'))
  for (const packageName of [abandonedNpmName, '@unrelated/orbo']) {
    const wrongPackage = run(['--package-spec', `${packageName}@1.0.0`, '--dry-run'])
    assert.equal(wrongPackage.status, 2, `setup must reject package scope: ${packageName}`)
  }
  fs.writeFileSync(manifest, JSON.stringify({ name: pkg.name }))
  assert.equal(run(['--dry-run']).status, 2, 'setup must reject installing into its own package')
  for (const command of ['cleanup', 'clean']) {
    assert.equal(run([command]).status, 2, `published ${command} must remain repository-only`)
  }
  pass('setup rejects missing dependency writes, other scopes and self-installation; cleanup stays repository-only')
} catch (error) {
  console.error(`FAIL  ${error.message}`)
  process.exit(1)
}
console.log('\nOwnership audit passed.')
NODE
