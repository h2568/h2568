Check the project for outdated dependencies and security vulnerabilities.

Run both checks:

```bash
cd /home/user/h2568 && npm outdated
```

```bash
cd /home/user/h2568 && npm audit
```

Summarise the results in plain English:
- How many packages are outdated and which ones matter most
- Any security vulnerabilities found (severity level, affected package, what to do)
- Suggested next steps
