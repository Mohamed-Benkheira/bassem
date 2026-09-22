import re

with open('/home/rerain/bassem/bassem/report-template/rapport_ar.tex', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Strip redundant "الجدول X.Y :" from table caption arguments
text = re.sub(r'\\begin\{(usecasetablear|dbtablear|teststablear)\}\{\s*الجدول\s*[\d\.]+\s*:\s*', r'\\begin{\1}{', text)

# 2. Fix \ucfieldar line breaks (replace \\ with \newline)
def fix_ucfield(m):
    head = m.group(1)
    body = m.group(2)
    body_clean = re.sub(r'\\\\\s*', r'\\newline\n    ', body)
    return f"\\ucfieldar{{{head}}}{{{body_clean}}}"

text = re.sub(r'\\ucfieldar\{([^}]+)\}\{([^}]+)\}', fix_ucfield, text)

# 3. Wrap verbatim environments in LTR if not already wrapped
def wrap_verb(m):
    v = m.group(1)
    return f"\\begin{{LTR}}\n\\begin{{verbatim}}{v}\\end{{verbatim}}\n\\end{{LTR}}"

text = re.sub(r'\\begin\{verbatim\}(.*?)\\end\{verbatim\}', wrap_verb, text, flags=re.DOTALL)
text = text.replace('\\begin{LTR}\n\\begin{LTR}', '\\begin{LTR}')
text = text.replace('\\end{LTR}\n\\end{LTR}', '\\end{LTR}')

# 4. Wrap all parenthesized ASCII phrases: (Phrase) -> (\LR{Phrase})
def wrap_parens(m):
    inner = m.group(1).strip()
    if inner.startswith(r'\LR{') or inner.startswith(r'\url{'):
        return m.group(0)
    if any(ord(c) >= 0x0600 and ord(c) <= 0x06FF for c in inner):
        return m.group(0)
    return f"(\\LR{{{inner}}})"

text = re.sub(r'\(([A-Za-z][A-Za-z0-9\.\+\-/_ :,]*)\)', wrap_parens, text)

# 5. Fix the Bibliography:
bib_pattern = r'(\\begin\{enumerate\}\[label=\{\[\\arabic\*\]\}\])(.*?)(\\end\{enumerate\})'
def fix_bib(m):
    prefix = m.group(1)
    body = m.group(2)
    suffix = m.group(3)
    items = re.split(r'(\\item\s+)', body)
    fixed_items = []
    current_item_header = ""
    for piece in items:
        if not piece.strip():
            continue
        if piece.startswith('\\item'):
            current_item_header = piece
        else:
            arabic_chars = len(re.findall(r'[\u0600-\u06FF]', piece))
            latin_chars = len(re.findall(r'[A-Za-z]', piece))
            if latin_chars > arabic_chars:
                # Wrap item in LTR
                fixed_items.append(f"{current_item_header}\\begin{{LTR}} {piece.strip()} \\end{{LTR}}\n")
            else:
                # Arabic item with English term at start
                piece_fixed = re.sub(r'\\textbf\{([^}]+)\}', lambda tm: f"\\textbf{{\\LR{{{tm.group(1)}}}}}", piece)
                fixed_items.append(f"{current_item_header}{piece_fixed}\n")
    return prefix + "\n" + "".join(fixed_items) + suffix

text = re.sub(bib_pattern, fix_bib, text, flags=re.DOTALL)

# 6. Clean any double \LR{\LR{...}}
while r'\LR{\LR{' in text:
    text = re.sub(r'\\LR\{\\LR\{([^}]+)\}\}', r'\\LR{\1}', text)

with open('/home/rerain/bassem/bassem/report-template/rapport_ar.tex', 'w', encoding='utf-8') as f:
    f.write(text)

print("Comprehensive fix applied to report-template/rapport_ar.tex!")
