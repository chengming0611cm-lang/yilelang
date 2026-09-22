import subprocess
import re
import sys

# Try to capture pinggy output
process = subprocess.Popen(
    ["ssh", "-p", "443", "-R0:localhost:3000", "a.pinggy.io", "-o", "StrictHostKeyChecking=no"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

for line in process.stdout:
    print("OUT:", line.strip())
    sys.stdout.flush()
    if ".pinggy.link" in line:
        with open("pinggy_url.txt", "w") as f:
            f.write(line.strip())
            
for line in process.stderr:
    print("ERR:", line.strip())
    sys.stdout.flush()
