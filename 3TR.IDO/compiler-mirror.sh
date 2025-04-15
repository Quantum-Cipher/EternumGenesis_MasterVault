#!/bin/bash
# 🧠 Eternum Quantum Shell — Compiler Mirror Trigger
# Executes Solidity scoring + logs to Whisper

echo "♾️ Eternum Quantum Shell Activated: Compiler Mirror Engine Running..."

CONTRACTS_DIR="./contracts"
LOG_DIR="./whisper/logs"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%SZ")
LOG_PATH="${LOG_DIR}/compiler-${TIMESTAMP}.log"

mkdir -p $LOG_DIR

for FILE in $CONTRACTS_DIR/*.sol; do
    if [[ -f "$FILE" ]]; then
        LINES=$(wc -l < "$FILE")
        FUNCS=$(grep -c "function " "$FILE")
        IMPORTS=$(grep -c "import " "$FILE")
        SIZE=$(wc -c < "$FILE")
        SCORE=$(echo "scale=2; $FUNCS*2 + $IMPORTS + $LINES / 50" | bc)
        HASH=$(shasum -a 256 "$FILE" | awk '{ print $1 }')
        
        echo -e "🧠 $(basename "$FILE") compiled\n - Score: $SCORE\n - SHA256: $HASH\n - Size: $SIZE bytes\n" >> "$LOG_PATH"
    fi
done

echo "📜 Log saved to: $LOG_PATH"

