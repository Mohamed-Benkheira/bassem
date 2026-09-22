import re

with open('/home/rerain/bassem/bassem/report-template/rapport_ar.tex', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove hardcoded "الجدول X.Y :" inside table arguments
content = re.sub(r'\\begin\{(usecasetablear|dbtablear|teststablear)\}\{\s*الجدول\s*[\d\.]+\s*:\s*', r'\\begin{\1}{', content)

# 2. Fix verbatim blocks to be inside LTR
def wrap_verbatim(match):
    verb_content = match.group(1)
    return "\\begin{LTR}\n\\begin{verbatim}" + verb_content + "\\end{verbatim}\n\\end{LTR}"

content = re.sub(r'\\begin\{verbatim\}(.*?)\\end\{verbatim\}', wrap_verbatim, content, flags=re.DOTALL)
content = content.replace('\\begin{LTR}\n\\begin{LTR}', '\\begin{LTR}')
content = content.replace('\\end{LTR}\n\\end{LTR}', '\\end{LTR}')

# 3. In usecasetablear, replace \\ with \newline within ucfieldar
def fix_ucfield(match):
    arg1 = match.group(1)
    arg2 = match.group(2)
    arg2_fixed = re.sub(r'\\\\\s*', r'\\newline\n    ', arg2)
    return "\\ucfieldar{" + arg1 + "}{" + arg2_fixed + "}"

content = re.sub(r'\\ucfieldar\{([^}]+)\}\{([^}]+)\}', fix_ucfield, content)

# 4. Specific Latin terms in parentheses to wrap with \LR{}
terms_to_wrap = [
    "Glossaire",
    "Brevet de Technicien Supérieur",
    "INSFP",
    "LNEMI",
    "International Organization for Standardization",
    "International Electrotechnical Commission",
    "Unified Modeling Language",
    "Unified Process",
    "Model - View - Controller",
    "Single Page Application",
    "Single Page Applications",
    "Application Programming Interface",
    "Role-Based Access Control",
    "Object-Relational Mapping",
    "Cross-Site Request Forgery",
    "Cross-Site Scripting",
    "HyperText Transfer Protocol Secure",
    "Transport Layer Security",
    "Linux, Nginx, MySQL, PHP",
    "Classic Monolith",
    "Monolith Classic",
    "Component-Based Architecture",
    "Static Typing",
    "Multi-Tenants",
    "Pest PHP / PHPUnit",
    "PHPUnit / PHP Pest",
    "LEMP Topology",
    "Domain Class Diagram",
    "SCHEDULED",
    "IN_PROGRESS",
    "CALIBRATED",
    "UNDER_REVIEW",
    "APPROVED",
    "REJECTED",
    "CERTIFIED",
    "DELIVERED",
    "ISO/IEC 17025",
    "ISO 17025",
    "RBAC",
    "MVC",
    "SPA",
    "API",
    "REST API",
    "REST",
    "ORM",
    "CSRF",
    "XSS",
    "ACID",
    "HTTP/HTTPS",
    "TLS",
    "PHPUnit",
    "PHP Pest",
    "Pest PHP",
    "MySQL 8.0",
    "MySQL",
    "LEMP",
    "Frontend",
    "Backend",
    "Model",
    "View",
    "Controller",
    "SQL Injection",
    "Migrations",
    "Seeders",
    "Tailwind CSS",
    "Inertia.js",
    "React 19",
    "React",
    "Laravel 12",
    "Laravel",
    "TypeScript",
    "PHP",
    "Nginx",
    "Ubuntu",
    "Docker",
    "Devis",
    "URL",
    "Excel",
    "PDF",
    "bcrypt",
    "JSON",
    "HTTPS",
    "HTTP",
    "TCP/IP",
    "World Wide Web"
]

for i in range(1, 14):
    terms_to_wrap.append(f"UC{i:02d}")

# For each term, wrap occurrences inside parentheses: (term) -> (\LR{term})
for term in sorted(terms_to_wrap, key=len, reverse=True):
    esc_term = re.escape(term)
    target = r'\(\s*' + esc_term + r'\s*\)'
    content = re.sub(target, lambda m, t=term: f"(\\LR{{{t}}})", content)
    # Clean up double \LR
    content = content.replace(f"\\LR{{\\LR{{{term}}}}}", f"\\LR{{{term}}}")

with open('/home/rerain/bassem/bassem/scratch/rapport_ar_fixed.tex', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete. Saved to scratch/rapport_ar_fixed.tex")
