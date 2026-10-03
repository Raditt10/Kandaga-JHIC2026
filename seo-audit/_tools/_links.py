import re, json
from urllib import request as urlreq

BASE = "http://localhost:3000"
pages = ["/", "/jurusan", "/galeri-karya", "/jurusan/rpl", "/jurusan/tkj", "/jurusan/analis-kimia"]

seen = {}
for p in pages:
    try:
        html = urlreq.urlopen(BASE + p, timeout=60).read().decode("utf-8", "replace")
    except Exception as e:
        print(p, "ERR", e)
        continue
    hrefs = re.findall(r'href="([^"#]+)"', html)
    internal = []
    for h in hrefs:
        if h.startswith("/") and not h.startswith("/_next") and not h.startswith("//"):
            h = h.split("?")[0]
            if h not in internal:
                internal.append(h)
    print("PAGE", p, "-> internal hrefs:", sorted(internal))

# check which of those actually exist
import urllib.error
candidates = set()
for p in pages:
    try:
        html = urlreq.urlopen(BASE + p, timeout=60).read().decode("utf-8", "replace")
    except Exception:
        continue
    for h in re.findall(r'href="([^"#]+)"', html):
        if h.startswith("/") and not h.startswith("/_next"):
            candidates.add(h.split("?")[0])
print("\n--- status of every internal href found ---")
for c in sorted(candidates):
    try:
        r = urlreq.urlopen(BASE + c, timeout=60)
        print(r.status, c)
    except urllib.error.HTTPError as e:
        print(e.code, c)
    except Exception as e:
        print("ERR", c, str(e)[:60])
