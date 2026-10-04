import json, re, io

BASE = r"D:\JHIC\Kandaga-JHIC2026\seo-audit"
out = io.StringIO()

for tag in ["pc", "mobile"]:
    ia = json.load(open(BASE + "\\run-" + tag + r"\issue_analysis.json", encoding="utf-8"))
    issues = ia["issues"]
    order = {"P0": 0, "P1": 1, "P2": 2}
    rows = sorted(issues.items(), key=lambda kv: (order.get(kv[1].get("priority", "P2"), 3),
                                                  -kv[1].get("count", 0)))
    out.write("=== %s : %d distinct issue types, total_pages=%s\n" % (tag.upper(), len(rows), ia["total_pages"]))
    for k, v in rows:
        out.write("  [%s] %-38s count=%-3s pct=%-6s sev=%s\n" % (
            v.get("priority"), k, v.get("count"), v.get("pct"), v.get("severity")))
    out.write("\n")

open(BASE + r"\_issues.txt", "w", encoding="utf-8").write(out.getvalue())
print(out.getvalue())
