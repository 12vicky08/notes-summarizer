#!/bin/bash

# Set up Git author to correctly credit the user's contribution graph
git config user.name "${GITHUB_ACTOR}"
git config user.email "${GITHUB_ACTOR_ID}+${GITHUB_ACTOR}@users.noreply.github.com"

# Generate a random number of commits between 3 and 5 as requested
NUM_COMMITS=$(( ( RANDOM % 3 ) + 3 ))
echo "Generating $NUM_COMMITS commits for today's contributions..."

for i in $(seq 1 $NUM_COMMITS); do
  echo "Contribution commit $i on $(date)" > .github/contribution_tracker.txt
  git add .github/contribution_tracker.txt
  git commit -m "chore(contributions): automated daily contribution $i/$(date +'%Y-%m-%d')"
  # sleep briefly to ensure distinct timestamps
  sleep 1
done
