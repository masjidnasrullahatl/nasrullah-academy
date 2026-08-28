#!/usr/bin/env bash
set -euo pipefail

read_dotenv_value() {
	local key="$1"
	local file=".env"

	if [[ ! -f "$file" ]]; then
		return 0
	fi

	local value
	value="$(
		awk -v key="$key" '
			$0 ~ "^[[:space:]]*" key "=" {
				sub("^[[:space:]]*" key "=", "")
				print
				exit
			}
		' "$file"
	)"

	value="${value%%#*}"
	value="${value#"${value%%[![:space:]]*}"}"
	value="${value%"${value##*[![:space:]]}"}"
	value="${value%\"}"
	value="${value#\"}"
	value="${value%\'}"
	value="${value#\'}"

	printf '%s' "$value"
}

VERCEL_DEPLOY_GIT_NAME="${VERCEL_DEPLOY_GIT_NAME:-$(read_dotenv_value VERCEL_DEPLOY_GIT_NAME)}"
VERCEL_DEPLOY_GIT_EMAIL="${VERCEL_DEPLOY_GIT_EMAIL:-$(read_dotenv_value VERCEL_DEPLOY_GIT_EMAIL)}"
VERCEL_DEPLOY_COMMIT_MESSAGE="${VERCEL_DEPLOY_COMMIT_MESSAGE:-$(read_dotenv_value VERCEL_DEPLOY_COMMIT_MESSAGE)}"
VERCEL_DEPLOY_COMMIT_MESSAGE="${VERCEL_DEPLOY_COMMIT_MESSAGE:-${1:-}}"
VERCEL_DEPLOY_BRANCH="${VERCEL_DEPLOY_BRANCH:-$(read_dotenv_value VERCEL_DEPLOY_BRANCH)}"
VERCEL_DEPLOY_SKIP_CHECKS="${VERCEL_DEPLOY_SKIP_CHECKS:-$(read_dotenv_value VERCEL_DEPLOY_SKIP_CHECKS)}"
VERCEL_DEPLOY_DRY_RUN="${VERCEL_DEPLOY_DRY_RUN:-$(read_dotenv_value VERCEL_DEPLOY_DRY_RUN)}"

if [[ -z "${VERCEL_DEPLOY_GIT_NAME:-}" || -z "${VERCEL_DEPLOY_GIT_EMAIL:-}" ]]; then
	echo "Missing deploy owner identity."
	echo "Add these to .env or pass them before the command:"
	echo "  VERCEL_DEPLOY_GIT_NAME=\"Owner Name\""
	echo "  VERCEL_DEPLOY_GIT_EMAIL=\"owner@example.com\""
	exit 1
fi

if [[ -z "${VERCEL_DEPLOY_COMMIT_MESSAGE:-}" ]]; then
	echo "Missing deploy commit message."
	echo "Usage:"
	echo "  yarn deploy:vercel -- \"Deploy message here\""
	echo ""
	echo "Or add this to .env:"
	echo "  VERCEL_DEPLOY_COMMIT_MESSAGE=\"Deploy message here\""
	exit 1
fi

current_branch="$(git branch --show-current)"
deploy_branch="${VERCEL_DEPLOY_BRANCH:-$current_branch}"

if [[ -z "$deploy_branch" ]]; then
	echo "Could not detect a Git branch. Set VERCEL_DEPLOY_BRANCH in .env."
	exit 1
fi

original_name="$(git config --local --get user.name || true)"
original_email="$(git config --local --get user.email || true)"

restore_git_identity() {
	if [[ -n "$original_name" ]]; then
		git config --local user.name "$original_name"
	else
		git config --local --unset user.name >/dev/null 2>&1 || true
	fi

	if [[ -n "$original_email" ]]; then
		git config --local user.email "$original_email"
	else
		git config --local --unset user.email >/dev/null 2>&1 || true
	fi
}

trap restore_git_identity EXIT INT TERM

git config --local user.name "$VERCEL_DEPLOY_GIT_NAME"
git config --local user.email "$VERCEL_DEPLOY_GIT_EMAIL"

echo "Preparing CI/CD deploy commit:"
echo "  branch: $deploy_branch"
echo "  name:   $(git config --local --get user.name)"
echo "  email:  $(git config --local --get user.email)"
echo "  commit: $VERCEL_DEPLOY_COMMIT_MESSAGE"

if [[ "$deploy_branch" != "$current_branch" ]]; then
	git checkout "$deploy_branch"
fi

if [[ "${VERCEL_DEPLOY_SKIP_CHECKS:-}" != "1" ]]; then
	yarn lint
	yarn build
fi

if [[ "${VERCEL_DEPLOY_DRY_RUN:-}" == "1" ]]; then
	echo "Dry run enabled. Skipping git add, git commit, and git push."
	exit 0
fi

git add -A

if git diff --cached --quiet; then
	echo "No local changes found. Creating an empty deploy commit to trigger CI/CD."
	git commit --allow-empty -m "$VERCEL_DEPLOY_COMMIT_MESSAGE"
else
	git commit -m "$VERCEL_DEPLOY_COMMIT_MESSAGE"
fi

git push origin "$deploy_branch"

echo "Pushed $deploy_branch to origin. Vercel Git integration should pick up the deploy."
