#!/bin/sh
set -eu

ROOT=$(CDPATH= cd "$(dirname "$0")/.." && pwd)
failures=0
pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1" >&2; failures=$((failures + 1)); }

cleanup_tmp=${TMPDIR:-/tmp}/orbv-cleanup-audit.$$
(umask 077 && mkdir "$cleanup_tmp") || exit 1
trap 'rm -rf "$cleanup_tmp"' 0
trap 'exit 130' 2
trap 'exit 143' 1 15

fixture() {
  cleanup_fixture="$cleanup_tmp/$1"
  mkdir -p "$cleanup_fixture/.agents" "$cleanup_fixture/.audits" \
    "$cleanup_fixture/src" "$cleanup_fixture/assets"
  cp -R "$ROOT/cli" "$cleanup_fixture/"
  cp "$ROOT/package.json" "$cleanup_fixture/"
  touch "$cleanup_fixture/tsdown.config.ts"
  git -C "$cleanup_fixture" init -q
}

snapshot() {
  find "$1" -print | LC_ALL=C sort
  find "$1" -type f -exec cksum {} \; | LC_ALL=C sort
}

fixture 'default checkout'
default_fixture=$cleanup_fixture
for relative in node_modules/package/src node_modules/package/assets \
  dist coverage .vitest .cache build out \
  'nested folder/node_modules/package/src' 'nested folder/dist' \
  'nested folder/coverage' 'nested folder/.vitest' 'nested folder/.cache' \
  'nested folder/build' 'nested folder/out'; do
  mkdir -p "$default_fixture/$relative"
  touch "$default_fixture/$relative/generated.js"
done
touch "$default_fixture/nested folder/build info.tsbuildinfo" \
  "$default_fixture/nested folder/archive [1]*.tgz"
multiline_artifact=$(printf 'two\nlines.tgz')
touch "$default_fixture/$multiline_artifact"
for relative in .git .agents .audits src assets; do
  touch "$default_fixture/$relative/preserve.tgz"
done
mkdir -p "$default_fixture/tracked [1]/dist" \
  "$default_fixture/source output/dist/src" \
  "$default_fixture/asset output/build/assets" \
  "$default_fixture/harness output/out/.agents"
touch "$default_fixture/tracked [1]/dist/keep.js" \
  "$default_fixture/tracked [1]/archive.tgz" \
  "$default_fixture/source output/dist/src/keep.js" \
  "$default_fixture/asset output/build/assets/keep.png" \
  "$default_fixture/harness output/out/.agents/keep.md"
git -C "$default_fixture" add -- 'tracked [1]'
mkdir -p "$default_fixture/vendor/repository/node_modules" \
  "$default_fixture/nested output/dist/repository/node_modules" \
  "$default_fixture/worktree/out/node_modules"
git -C "$default_fixture/vendor/repository" init -q
git -C "$default_fixture/nested output/dist/repository" init -q
printf 'gitdir: /unavailable/worktree/metadata\n' > "$default_fixture/worktree/out/.git"
mkdir -p "$cleanup_tmp/external/dist" "$cleanup_tmp/external/node_modules" \
  "$default_fixture/linked dependencies" "$default_fixture/dangling dependencies"
touch "$cleanup_tmp/external/dist/keep.js" "$cleanup_tmp/external/node_modules/keep.js"
ln -s "$cleanup_tmp/external" "$default_fixture/external link"
ln -s "$cleanup_tmp/external/node_modules" "$default_fixture/linked dependencies/node_modules"
ln -s "$cleanup_tmp/missing" "$default_fixture/dangling dependencies/node_modules"

if (cd "$cleanup_tmp" && "$default_fixture/cli/orbv" cleanup) >"$cleanup_tmp/default.log" 2>&1; then
  pass 'default cleanup works from another working directory'
else
  fail 'default cleanup failed'
  cat "$cleanup_tmp/default.log" >&2
fi
if [ ! -e "$default_fixture/node_modules" ] && \
  [ ! -e "$default_fixture/nested folder/node_modules" ]; then
  pass 'default cleanup removes root and nested dependencies, including dependency source/assets'
else
  fail 'default cleanup leaves root or nested node_modules'
fi
generated_remains=false
for relative in dist coverage .vitest .cache build out \
  'nested folder/dist' 'nested folder/coverage' 'nested folder/.vitest' \
  'nested folder/.cache' 'nested folder/build' 'nested folder/out' \
  'nested folder/build info.tsbuildinfo' 'nested folder/archive [1]*.tgz' \
  "$multiline_artifact"; do
  [ ! -e "$default_fixture/$relative" ] || generated_remains=true
done
if [ "$generated_remains" = false ]; then
  pass 'recursive output and artifact cleanup handles spaces, glob characters and newlines'
else
  fail 'generated output or artifact remains'
fi
protected_missing=false
for relative in .git/preserve.tgz .agents/preserve.tgz .audits/preserve.tgz \
  src/preserve.tgz assets/preserve.tgz 'tracked [1]/dist/keep.js' \
  'tracked [1]/archive.tgz' 'source output/dist/src/keep.js' \
  'asset output/build/assets/keep.png' 'harness output/out/.agents/keep.md'; do
  [ -f "$default_fixture/$relative" ] || protected_missing=true
done
if [ "$protected_missing" = false ]; then
  pass 'tracked paths, source, assets, Git and harness state survive'
else
  fail 'cleanup removed tracked or protected state'
fi
if [ -d "$default_fixture/vendor/repository/node_modules" ] && \
  [ -d "$default_fixture/nested output/dist/repository/node_modules" ] && \
  [ -d "$default_fixture/worktree/out/node_modules" ]; then
  pass 'nested repositories and worktree metadata protect generated descendants and ancestors'
else
  fail 'cleanup entered or removed a nested repository'
fi
if [ -L "$default_fixture/external link" ] && \
  [ ! -L "$default_fixture/linked dependencies/node_modules" ] && \
  [ ! -L "$default_fixture/dangling dependencies/node_modules" ] && \
  [ -f "$cleanup_tmp/external/dist/keep.js" ] && \
  [ -f "$cleanup_tmp/external/node_modules/keep.js" ]; then
  pass 'generated symlinks are unlinked without following live or dangling destinations'
else
  fail 'symlink cleanup is incomplete or changed an external destination'
fi
if "$default_fixture/cli/orbv" cleanup >"$cleanup_tmp/repeated.log" 2>&1; then
  pass 'cleanup is idempotent'
else
  fail 'repeated cleanup fails'
fi

fixture 'options checkout'
options_fixture=$cleanup_fixture
mkdir -p "$options_fixture/node_modules/package/src" \
  "$options_fixture/nested/node_modules" "$options_fixture/nested/dist" \
  "$options_fixture/dist/container/node_modules"
touch "$options_fixture/nested/result.tgz" "$options_fixture/dist/index.js" \
  "$options_fixture/dist/container/index.js"
snapshot "$options_fixture" > "$cleanup_tmp/before"
if "$options_fixture/cli/orbv" cleanup --dry-run >"$cleanup_tmp/dry.log" 2>&1 && \
  grep -F 'would remove node_modules' "$cleanup_tmp/dry.log" >/dev/null; then
  snapshot "$options_fixture" > "$cleanup_tmp/after"
  if cmp -s "$cleanup_tmp/before" "$cleanup_tmp/after"; then
    pass 'dry run previews dependency removal without mutations'
  else
    fail 'dry run changed the checkout'
  fi
else
  fail 'dry run does not preview cleanup'
fi
for mode in unknown conflict reversed help; do
  case "$mode" in
    unknown) set -- --unknown ;;
    conflict) set -- --dependencies --keep-dependencies ;;
    reversed) set -- --keep-dependencies --dependencies ;;
    help) set -- --help ;;
  esac
  option_status=0
  "$options_fixture/cli/orbv" cleanup "$@" >"$cleanup_tmp/option.log" 2>&1 || option_status=$?
  expected_status=2
  [ "$mode" != help ] || expected_status=0
  snapshot "$options_fixture" > "$cleanup_tmp/after"
  if [ "$option_status" -eq "$expected_status" ] && cmp -s "$cleanup_tmp/before" "$cleanup_tmp/after"; then
    pass "$mode options return $expected_status without mutations"
  else
    fail "$mode options returned $option_status or changed the checkout"
  fi
done
if "$options_fixture/cli/orbv" cleanup --keep-dependencies >"$cleanup_tmp/keep.log" 2>&1 && \
  [ -d "$options_fixture/node_modules/package/src" ] && \
  [ -d "$options_fixture/nested/node_modules" ] && \
  [ -d "$options_fixture/dist/container/node_modules" ] && \
  [ ! -e "$options_fixture/dist/index.js" ] && \
  [ ! -e "$options_fixture/dist/container/index.js" ] && \
  [ ! -e "$options_fixture/nested/dist" ] && \
  [ ! -e "$options_fixture/nested/result.tgz" ]; then
  pass 'output-only cleanup preserves every dependency directory'
else
  fail 'output-only cleanup does not preserve dependencies and remove output'
fi
if "$options_fixture/cli/orbv" clean --dependencies >"$cleanup_tmp/legacy.log" 2>&1 && \
  [ ! -e "$options_fixture/node_modules" ] && \
  [ ! -e "$options_fixture/nested/node_modules" ]; then
  pass 'clean alias and legacy --dependencies remove dependencies recursively'
else
  fail 'clean alias or legacy --dependencies does not clean recursively'
fi

fixture 'failure checkout'
failure_fixture=$cleanup_fixture
mkdir -p "$failure_fixture/dist" "$cleanup_tmp/failing-bin"
touch "$failure_fixture/dist/preserve.js"
cat > "$cleanup_tmp/failing-bin/rm" <<'SH'
#!/bin/sh
printf 'simulated removal failure\n' >&2
exit 23
SH
chmod +x "$cleanup_tmp/failing-bin/rm"
failure_status=0
PATH="$cleanup_tmp/failing-bin:$PATH" "$failure_fixture/cli/orbv" cleanup >"$cleanup_tmp/failure.log" 2>&1 || failure_status=$?
if [ "$failure_status" -eq 23 ] && \
  grep -F 'simulated removal failure' "$cleanup_tmp/failure.log" >/dev/null && \
  [ -f "$failure_fixture/dist/preserve.js" ]; then
  pass 'removal errors remain visible and preserve the failing utility exit status'
else
  fail 'cleanup hides a removal error or loses its exit status'
fi
printf 'invalid Git index\n' > "$failure_fixture/.git/index"
if "$failure_fixture/cli/orbv" cleanup >"$cleanup_tmp/index.log" 2>&1; then
  fail 'cleanup proceeds when tracked-path inspection fails'
elif [ -f "$failure_fixture/dist/preserve.js" ]; then
  pass 'unreadable tracked state fails closed'
else
  fail 'cleanup removed output despite unreadable tracked state'
fi

fixture 'minimal tools checkout'
minimal_fixture=$cleanup_fixture
mkdir -p "$minimal_fixture/node_modules/package/src" "$cleanup_tmp/minimal-bin"
for utility in dirname git find rm; do
  ln -s "$(command -v "$utility")" "$cleanup_tmp/minimal-bin/$utility"
done
if NO_COLOR=1 PATH="$cleanup_tmp/minimal-bin" "$minimal_fixture/cli/orbv" cleanup >"$cleanup_tmp/minimal.log" 2>&1 && \
  [ ! -e "$minimal_fixture/node_modules" ]; then
  pass 'cleanup runs with shell utilities and Git, without Node or a package manager'
else
  fail 'cleanup needs tools beyond shell utilities and Git'
  cat "$cleanup_tmp/minimal.log" >&2
fi
mkdir -p "$cleanup_tmp/published"
cp -R "$ROOT/cli" "$cleanup_tmp/published/"
cp "$ROOT/package.json" "$cleanup_tmp/published/"
published_status=0
"$cleanup_tmp/published/cli/orbv" cleanup >"$cleanup_tmp/published.log" 2>&1 || published_status=$?
if [ "$published_status" -eq 2 ] && \
  grep -F 'only from an OrbV source checkout' "$cleanup_tmp/published.log" >/dev/null; then
  pass 'published packages reject repository cleanup'
else
  fail 'published packages permit cleanup or return an unexpected error'
fi

if [ "$failures" -ne 0 ]; then
  printf '\n%d cleanup audit failure(s).\n' "$failures" >&2
  exit 1
fi
printf '\nCleanup audit passed.\n'
