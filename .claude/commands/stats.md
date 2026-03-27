Show codebase statistics for the project.

Run:

```bash
cd /home/user/h2568
echo "--- TypeScript files ---"
find src -name "*.ts" | wc -l
echo "--- Total lines of code ---"
find src -name "*.ts" | xargs wc -l | tail -1
echo "--- Lines per file (largest first) ---"
find src -name "*.ts" | xargs wc -l | sort -rn | head -10
echo "--- Dependencies ---"
cat package.json | jq '{dependencies, devDependencies}'
echo "--- Checkpoints saved ---"
ls .claude-flow/checkpoints/*.json 2>/dev/null | wc -l
```

Present the results in a clean, readable summary.
