#!/usr/bin/env python3
"""Generate a fill command from field.txt for the ODG file."""
import re
from pathlib import Path

def parse_fields(filepath: Path):
    fields = {}
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line.startswith('- '):
                field_name = line[2:].strip()
                if field_name.startswith('case_'):
                    fields[field_name] = 'false'
                else:
                    fields[field_name] = ''
    return fields

def generate_command(fields, odg_path='c.odg', pdf_path='filled_form.pdf'):
    sets = []
    for name, value in fields.items():
        if value:
            sets.append(f'{name}="{value}"')
        else:
            sets.append(f'{name}=""')
    
    set_str = ' --set '.join(sets)
    command = f'python3 fill_odg.py {odg_path} --set {set_str} --pdf {pdf_path}'
    return command

if __name__ == '__main__':
    field_file = Path('field.txt')
    if not field_file.exists():
        print("field.txt not found!")
        exit(1)
    
    fields = parse_fields(field_file)
    command = generate_command(fields)
    
    print("Generated command saved to fill_command.sh")
    with open('fill_command.sh', 'w', encoding='utf-8') as f:
        f.write('#!/bin/bash\n')
        f.write('libreoffice --headless --accept="socket,host=localhost,port=2002;urp;StarOffice.ServiceManager" &\n')
        f.write('sleep 2\n')
        f.write(command + '\n')
        f.write('kill %1\n')
    
    print(f"Total fields: {len(fields)}")
    print(f"Command length: {len(command)} characters")
