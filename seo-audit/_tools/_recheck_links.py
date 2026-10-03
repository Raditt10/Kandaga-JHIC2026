import re
import urllib.request
import urllib.error

BASE = "http://localhost:3000"


def get(path):
    r = urllib.request.urlopen(BASE + path, timeout=60)
    return r.status, r.read().decode("utf-8", "replace")


status, home = get("/")
print("--- contoh konteks kemunculan 'tkj' di HTML beranda ---")
for m in list(re.finditer("tkj", home))[:5]:
    print("   ..." + home[max(0, m.start() - 45):m.start() + 20].replace("\n", " ") + "...")

print()
print("--- status + link jurusan yang BENAR-BENAR ada di HTML tiap halaman ---")
targets = ["/jurusan", "/jurusan/rpl", "/jurusan/tkj", "/jurusan/analis-kimia"]
for p in targets:
    try:
        code, html = get(p)
    except urllib.error.HTTPError as e:
        code, html = e.code, ""
    found = [t for t in targets[1:] if ('href="%s"' % t) in html]
    print("  %-24s status %s | link jurusan di HTML: %s" % (p, code, found))

print()
found_home = [t for t in targets if ('href="%s"' % t) in home]
print("beranda: link jurusan yang ada di HTML ->", found_home)
