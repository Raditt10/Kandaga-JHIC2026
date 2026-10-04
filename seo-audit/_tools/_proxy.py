"""Local reverse proxy: accepts crawler requests on 8080 and forwards clean
HTTP/1.1 GETs to the Next.js dev server on 127.0.0.1:3000.

Needed because the audit crawler always requests with a browser TLS/HTTP
fingerprint, which the Next.js 16 dev server answers with an empty reply.
The target site under audit is still the same local Next.js app.
"""
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib import request as urlreq
from urllib.error import HTTPError, URLError

UPSTREAM = "http://127.0.0.1:3000"
HOP = {"connection", "keep-alive", "transfer-encoding", "upgrade",
       "http2-settings", "te", "content-length"}


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    server_version = "auditproxy/1.0"

    def log_message(self, *a):
        pass

    def _forward(self, method):
        try:
            req = urlreq.Request(UPSTREAM + self.path, method="GET",
                                 headers={"User-Agent": self.headers.get("User-Agent", "audit"),
                                          "Accept": "text/html,application/xhtml+xml,*/*",
                                          "Accept-Language": "id,en;q=0.9"})
            with urlreq.urlopen(req, timeout=60) as resp:
                body = resp.read()
                status = resp.status
                headers = resp.headers.items()
        except HTTPError as e:
            body = e.read() or b""
            status = e.code
            headers = e.headers.items()
        except URLError as e:
            body = str(e).encode()
            status = 502
            headers = [("Content-Type", "text/plain")]
        except Exception as e:  # noqa: BLE001
            body = str(e).encode()
            status = 500
            headers = [("Content-Type", "text/plain")]

        self.send_response(status)
        for k, v in headers:
            if k.lower() in HOP or k.lower() == "content-encoding":
                continue
            self.send_header(k, v)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if method == "GET":
            self.wfile.write(body)

    def do_GET(self):
        self._forward("GET")

    def do_HEAD(self):
        self._forward("HEAD")


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
