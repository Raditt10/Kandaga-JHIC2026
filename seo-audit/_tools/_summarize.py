import io, json
import pandas as pd

out = io.StringIO()
BASE = r"D:\JHIC\Kandaga-JHIC2026\seo-audit"

for tag in ["pc", "mobile"]:
    run = BASE + "\\run-" + tag
    df = pd.read_excel(run + r"\crawl_result.xlsx", sheet_name="All Pages")
    out.write("### %s pages=%d\n" % (tag.upper(), len(df)))
    for _, r in df.iterrows():
        path = str(r["url"]).replace("http://localhost:8080", "") or "/"
        out.write("%s | %s | type=%s | wc=%s | h1=%s | inlinks=%s | outlinks=%s | img=%s/noalt=%s | canonSelf=%s | jsonld=%s | cq=%s%s | desclen=%s | title=%s\n" % (
            r["status_code"], path, r["page_type"], r["word_count"], r["h1_count"],
            r["internal_link_count"], r["external_link_count"], r["images_total"],
            r["images_no_alt_count"], r["canonical_is_self_ref"], r["json_ld_count"],
            r["content_quality_score"], r["content_quality_grade"],
            r["meta_description_length"], str(r["title"])[:70]))
    out.write("\nISSUES %s\n" % tag.upper())
    ia = json.load(open(run + r"\issue_analysis.json", encoding="utf-8"))
    if isinstance(ia, dict):
        out.write("keys: %s\n" % list(ia)[:8])
        for k, v in list(ia.items())[:60]:
            if isinstance(v, list):
                out.write("%s -> list(%d): %s\n" % (k, len(v), json.dumps(v[:12], ensure_ascii=False)[:600]))
            elif isinstance(v, dict):
                out.write("%s -> dict: %s\n" % (k, json.dumps(v, ensure_ascii=False)[:700]))
            else:
                out.write("%s -> %s\n" % (k, v))
    else:
        out.write(json.dumps(ia, ensure_ascii=False)[:3000] + "\n")
    out.write("\n")

open(BASE + r"\_summary.txt", "w", encoding="utf-8").write(out.getvalue())
print("written", len(out.getvalue()))
