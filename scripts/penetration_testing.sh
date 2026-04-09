#!/bin/bash

# 🧬 Persona: Security Specialist
# ⚡ Purpose: Automates a baseline penetration scan to provide security reports to clinics.

TARGET_URL="http://localhost:3000"
REPORT_NAME="security-audit-$(date +%Y%m%d).html"

echo "[Security] Initiating OWASP ZAP Baseline Scan for ${TARGET_URL}..."

# Assuming ZAP is installed locally or running in Docker
# This script triggers the ZAP baseline scan container
docker run -t owasp/zap2docker-stable zap-baseline.py \
    -t "${TARGET_URL}" \
    -g gen.conf \
    -r "${REPORT_NAME}"

echo "[Security] Scan complete. Report generated: ${REPORT_NAME}"
echo "[Security] Review findings before onboarding enterprise clients."
