import os, sys, json, time, subprocess
from pathlib import Path

ASSETS = Path(r"C:\Users\ASUS\.accio\accounts\1793554976\plugins\installed\geo-agent\skills\seo-full-audit\assets")
sys.path.insert(0, str(ASSETS))
import pandas as pd
import seo_audit_run as sar

BASE = Path(r"D:\JHIC\Kandaga-JHIC2026\seo-audit")
TARGET = "http://localhost:8080"
CLEAN = ["crawl_result.xlsx", "sampled_pages.json", "tech_seo_report.pdf",
         "content_report.pdf", "seo_audit_user_guide.pdf", "issue_analysis.json",
         "url_inventory.xlsx"]

proxy = subprocess.Popen([sys.executable, str(BASE / "_proxy.py"), "8080"],
                         cwd=str(BASE), stdout=subprocess.DEVNULL,
                         stderr=subprocess.DEVNULL)
time.sleep(3)
print("proxy pid:", proxy.pid, "alive:", proxy.poll() is None, flush=True)

for ua, tag in [("googlebot", "pc"), ("googlebot-mobile", "mobile")]:
    run = BASE / f"run-{tag}"
    run.mkdir(parents=True, exist_ok=True)
    for f in CLEAN:
        p = run / f
        if p.exists():
            p.unlink()
    print(f"=== [{tag}] crawl start (ua={ua}) ===", flush=True)
    cmd = [sys.executable, str(ASSETS / "seo_crawler.py"),
           "--url", TARGET, "--max-pages", "50", "--max-depth", "3",
           "--output", str(run / "crawl_result.xlsx"), "--ua", ua, "--no-robots",
           "--concurrency", "3", "--delay-min", "0.3", "--delay-max", "1.0"]
    r = subprocess.run(cmd, cwd=str(run), capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    print("crawler rc=", r.returncode, flush=True)
    print((r.stdout or "")[-1500:], flush=True)
    if r.returncode != 0:
        print("STDERR:", (r.stderr or "")[-1500:], flush=True)

    xlsx = run / "crawl_result.xlsx"
    ok, msg = sar.validate_crawl(str(xlsx), "localhost:8080", "en", max_rows=800)
    print(f"validate ok={ok} msg={msg}", flush=True)

    n = sar.build_sampled_pages(str(xlsx), str(run / "sampled_pages.json"))
    print("sampled_pages =", n, flush=True)

    r2 = subprocess.run([sys.executable, str(ASSETS / "reporter.py"), str(run), "--lang", "en"],
                        cwd=str(run), capture_output=True, text=True,
                        encoding="utf-8", errors="replace")
    print("reporter rc=", r2.returncode, flush=True)
    print((r2.stdout or "")[-1200:], flush=True)
    print("FILES:", sorted(p.name for p in run.iterdir()), flush=True)
