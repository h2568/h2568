Restore a previous checkpoint.

1. List available checkpoints:
```bash
cd /home/user/h2568 && npx . checkpoint list
```

2. Show the list to the user and ask which one to restore (default to the most recent).

3. Confirm with the user before restoring, then run:
```bash
cd /home/user/h2568 && npx . checkpoint restore <id>
```

4. Confirm the restore was successful.
