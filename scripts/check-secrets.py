import re, subprocess, json
from pathlib import Path
patterns = [r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',r'\bgh[pousr]_[A-Za-z0-9]{30,}\b',r'\bgithub_pat_[A-Za-z0-9_]{30,}\b',r'\bAKIA[A-Z0-9]{16}\b',r'\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b',r'\bxox[baprs]-[A-Za-z0-9-]{20,}\b']
files = subprocess.check_output(['git','ls-files','-z']).decode().split('\0')
findings=[]
for name in filter(None,files):
 p=Path(name)
 if not p.is_file(): continue
 try:s=p.read_text()
 except UnicodeError:continue
 if any(re.search(pattern,s) for pattern in patterns):findings.append(name)
print(json.dumps({'scope':'tracked files; high-confidence credential/private-key patterns','files':len(files)-1,'findings':findings}))
raise SystemExit(bool(findings))
