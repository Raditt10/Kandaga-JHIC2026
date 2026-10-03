import json, re, io, urllib.request, urllib.error

BASE = "http://localhost:3000"
PAGES = ["/", "/jurusan", "/jurusan/rpl", "/jurusan/analis-kimia", "/galeri-karya", "/tentang"]

out = {}
for p in PAGES:
    try:
        html = urllib.request.urlopen(BASE + p, timeout=60).read().decode("utf-8", "replace")
        status = 200
    except urllib.error.HTTPError as e:
        out[p] = {"status": e.code}
        continue
    except Exception as e:
        out[p] = {"status": "ERR " + str(e)[:80]}
        continue

    body = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", html)
    text = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", body)).strip()
    heads = lambda t: [re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", x)).strip()[:90]
                       for x in re.findall(r"<%s[^>]*>(.*?)</%s>" % (t, t), body, re.S | re.I)]
    hrefs = re.findall(r'href="([^"#]+)"', html)
    imgs = re.findall(r"<img[^>]*>", html)
    q_heads = [h for h in heads("h2") + heads("h3") + heads("h4") if h.endswith("?")]
    lower = text.lower()

    out[p] = {
        "status": status,
        "words": len(text.split()),
        "h1": heads("h1"), "h2": heads("h2"), "h3": heads("h3"),
        "h2_count": len(heads("h2")), "h3_count": len(heads("h3")),
        "question_headings": q_heads,
        "faq_word": lower.count("faq") + lower.count("pertanyaan yang sering"),
        "details_tags": len(re.findall(r"(?i)<details", html)),
        "json_ld": len(re.findall(r'application/ld\+json', html)),
        "tables": len(re.findall(r"(?i)<table", html)),
        "lists": len(re.findall(r"(?i)<(ul|ol)[ >]", html)),
        "internal_links": len([h for h in hrefs if h.startswith("/") and not h.startswith("/_next")]),
        "external_links": len(set(h for h in hrefs if h.startswith("http") and "localhost" not in h)),
        "imgs": len(imgs), "imgs_no_alt": len([i for i in imgs if 'alt=' not in i]),
        "byline": bool(re.search(r"(?i)\b(oleh|penulis|author|ditulis|narasumber|by)\b", text)),
        "compare_words": len(re.findall(r"(?i)\b(vs\.?|versus|dibanding|perbandingan|bandingkan)\b", text)),
        "review_words": len(re.findall(r"(?i)\b(testimoni|ulasan|review|kata mereka|alumni berkata)\b", text)),
        "dates": re.findall(r"(?i)\b(diperbarui|terakhir diperbarui|updated|20\d\d)\b", text)[:5],
        "numbers_stats": len(re.findall(r"\b\d+([.,]\d+)?\s*(%|persen|siswa|karya|mitra|perusahaan|tahun)?\b", text)),
        "has_trust_terms": [t for t in ["terverifikasi", "verifikasi", "akreditasi", "mitra industri",
                                        "guru pembimbing", "smkn 13 bandung", "kurikulum merdeka",
                                        "sertifikasi", "pkl", "magang"] if t in lower],
        "title": (re.search(r"<title>(.*?)</title>", html, re.S).group(1).strip()[:120]
                  if re.search(r"<title>(.*?)</title>", html, re.S) else ""),
    }

open(r"D:\JHIC\Kandaga-JHIC2026\seo-audit\_tools\_geo_probe.json", "w", encoding="utf-8").write(
    json.dumps(out, ensure_ascii=False, indent=1))
print(json.dumps(out, ensure_ascii=False, indent=1)[:6000])
