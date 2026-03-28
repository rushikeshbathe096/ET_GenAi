import subprocess
import json
import sys
import os

req_file = 'd:/Soham_Jadhav/ET_GenAi/requirements.txt'

try:
    pip_out = subprocess.check_output([sys.executable, '-m', 'pip', 'list', '--format', 'json']).decode('utf-8')
    pip_pkgs = {p['name'].lower(): p['version'] for p in json.loads(pip_out)}
    reqs = []
    with open(req_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                reqs.append(line.split('==')[0].lower())

    missing_pip = [r for r in reqs if r not in pip_pkgs]

    print("--- Python Missing ---")
    for m in missing_pip: print(m)
    print("--- Python Installed ---")
    for r in reqs:
        if r in pip_pkgs:
            print(f"{r}=={pip_pkgs[r]}")
except Exception as e:
    print(f"Error checking pip: {e}")

try:
    npm_out = subprocess.check_output(['npm.cmd', 'ls', '--json'], cwd='d:/Soham_Jadhav/ET_GenAi/dashboard', shell=True).decode('utf-8')
    npm_data = json.loads(npm_out)
except subprocess.CalledProcessError as e:
    npm_data = json.loads(e.output.decode('utf-8'))
except Exception as e:
    print(f"Error checking npm: {e}")
    npm_data = {}

npm_installed = npm_data.get('dependencies', {})

print("--- Node Dependencies ---")
try:
    with open('d:/Soham_Jadhav/ET_GenAi/dashboard/package.json', 'r') as f:
        pkg = json.load(f)
    deps = list(pkg.get('dependencies', {}).keys()) + list(pkg.get('devDependencies', {}).keys())
    
    missing_npm = []
    for d in deps:
        if d not in npm_installed or 'version' not in npm_installed[d]:
            if 'missing' in npm_installed.get(d, {}):
                missing_npm.append(d)
                print(f"{d} MISSING")
            elif 'peerMissing' in npm_installed.get(d, {}):
                print(f"{d} PEER MISSING")
            elif 'version' not in npm_installed.get(d, {}):
                missing_npm.append(d)
                print(f"{d} MISSING VERSION")
            else:
                print(f"{d}@{npm_installed[d]['version']}")
        else:
            print(f"{d}@{npm_installed[d]['version']}")
            
    print("--- Node Missing ---")
    for m in missing_npm: print(m)
    
except Exception as e:
    print(f"Error checking node missing: {e}")
