import re

def main():
    with open('requirements.txt', 'r') as f:
        lines = f.readlines()
        
    seen = set()
    new_lines = []
    
    for line in lines:
        stripped = line.strip()
        if not stripped or stripped.startswith('#'):
            new_lines.append(line)
            continue
            
        match = re.match(r'^([a-zA-Z0-9_\-]+)', stripped)
        if match:
            pkg = match.group(1).lower().replace('_', '-')
            if pkg in seen:
                continue
            seen.add(pkg)
        new_lines.append(line)
        
    with open('requirements.txt', 'w') as f:
        f.writelines(new_lines)
    print(f"Old length: {len(lines)}, new length: {len(new_lines)}")

if __name__ == '__main__':
    main()
