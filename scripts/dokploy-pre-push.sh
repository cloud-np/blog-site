#!/bin/sh

set -eu

REPO_ROOT=$(git rev-parse --show-toplevel)
ENV_FILE="$REPO_ROOT/.env"

info() {
	printf '%s\n' "$1"
}

fail() {
	printf '%s\n' "$1" >&2
	exit 1
}

trim() {
	printf '%s' "$1" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}

load_webhook() {
	if [ ! -f "$ENV_FILE" ]; then
		return 1
	fi

	value=$(grep '^DOKPLOY_WEBHOOK=' "$ENV_FILE" | tail -n 1 | cut -d '=' -f 2- || true)
	value=$(trim "$value")
	value=$(printf '%s' "$value" | sed "s/^'//; s/'$//; s/^\"//; s/\"$//")

	if [ -z "$value" ]; then
		return 1
	fi

	DOKPLOY_WEBHOOK=$value
	export DOKPLOY_WEBHOOK
	return 0
}

json_escape() {
	printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

should_check_main=0

while read -r local_ref local_sha remote_ref remote_sha; do
	if [ "$remote_ref" = "refs/heads/main" ] || [ "$local_ref" = "refs/heads/main" ]; then
		should_check_main=1
		break
	fi
done

if [ "$should_check_main" -ne 1 ]; then
	info "pre-push: skipping Dokploy deploy hook because this push does not target main"
	exit 0
fi

if ! load_webhook; then
	fail "pre-push: blocking push to main because DOKPLOY_WEBHOOK is missing from .env\npre-push: add DOKPLOY_WEBHOOK=http://100.104.48.88:3000/api/deploy/<your-webhook-hash> to .env and push again"
fi

info "pre-push: triggering Dokploy deploy webhook for main"

commit_hash=$(git rev-parse HEAD)
commit_message=$(git log -1 --pretty=%s)
escaped_commit_message=$(json_escape "$commit_message")

payload=$(printf '{"push":{"changes":[{"new":{"name":"main","target":{"message":"%s","hash":"%s"}}}]}}' "$escaped_commit_message" "$commit_hash")

if ! response=$(curl --fail --silent --show-error --max-time 15 --request POST "$DOKPLOY_WEBHOOK" -H "Content-Type: application/json" -H "X-Event-Key: repo:push" --data "$payload"); then
	fail "pre-push: Dokploy webhook request failed, aborting push to main"
fi

info "pre-push: $response"
info "pre-push: Dokploy webhook accepted"
