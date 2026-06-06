#!/bin/bash
# StellarRoute — Testnet contract smoke tests
# Usage: STELLARROUTE_TESTNET_ROUTER_ID=C... STELLARROUTE_SMOKE_ROUTE='...' ./scripts/smoke-test-testnet.sh --network testnet

set -euo pipefail
source "$(dirname "$0")/lib/common.sh"
trap 'trap_with_context ${LINENO} $?' ERR

parse_network_flag "$@"
ensure_soroban_cli
configure_network

CONTRACT_ID="${STELLARROUTE_TESTNET_ROUTER_ID:-${SOROBAN_CONTRACT_ID:-}}"
if [[ -z "${CONTRACT_ID}" && -f "$(deployment_file)" ]]; then
    CONTRACT_ID="$(get_contract_id)"
fi

if [[ -z "${CONTRACT_ID}" ]]; then
    log_error "Missing STELLARROUTE_TESTNET_ROUTER_ID or SOROBAN_CONTRACT_ID."
    exit 1
fi

SMOKE_ROUTE="${STELLARROUTE_SMOKE_ROUTE:-}"
SMOKE_AMOUNT_IN="${STELLARROUTE_SMOKE_AMOUNT_IN:-10000000}"

if [[ -z "${SMOKE_ROUTE}" ]]; then
    log_error "Missing STELLARROUTE_SMOKE_ROUTE."
    exit 1
fi

log_info "Running testnet smoke tests against ${CONTRACT_ID}"

log_info "Calling validate_route..."
soroban_cmd contract invoke \
    --id "${CONTRACT_ID}" \
    --network "${NETWORK}" \
    -- validate_route \
    --route "${SMOKE_ROUTE}"
log_ok "validate_route passed"

log_info "Calling get_quote..."
soroban_cmd contract invoke \
    --id "${CONTRACT_ID}" \
    --network "${NETWORK}" \
    -- get_quote \
    --amount_in "${SMOKE_AMOUNT_IN}" \
    --route "${SMOKE_ROUTE}"
log_ok "get_quote passed"

log_ok "Testnet smoke tests passed"
