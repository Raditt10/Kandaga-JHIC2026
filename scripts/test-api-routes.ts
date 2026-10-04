import { NextRequest } from "next/server";
import { GET as getGallery } from "../src/app/api/gallery/route";
import { GET as getGalleryDetail } from "../src/app/api/gallery/[id]/route";
import { GET as getStudentProfile } from "../src/app/api/siswa/[id]/route";
import { GET as getCachedMedia } from "../src/app/api/media/[filename]/route";
import { GET as getCachedImage } from "../src/app/api/cache/image/route";
import assert from "assert";

async function runApiTests() {
  console.log("=== Testing Backend API Routes with Redis Caching ===");

  // 1. Test GET /api/gallery
  console.log("\nTest 1: GET /api/gallery");
  const req1 = new NextRequest("http://localhost:3000/api/gallery?page=1&limit=6&major=semua");
  const res1 = await getGallery(req1);
  assert.strictEqual(res1.status, 200, "Gallery API should return 200");
  const data1 = await res1.json();
  assert(Array.isArray(data1.projects), "Projects should be an array");
  assert(data1.pagination, "Pagination should exist");
  assert.strictEqual(res1.headers.get("X-Cache"), "MISS", "First call should be cache MISS");
  console.log(`  ✓ First call returned ${data1.projects.length} projects, X-Cache: MISS`);

  // Call again with identical query - should be cache HIT
  const req1Hit = new NextRequest("http://localhost:3000/api/gallery?page=1&limit=6&major=semua");
  const res1Hit = await getGallery(req1Hit);
  assert.strictEqual(res1Hit.status, 200, "Gallery API cache hit should return 200");
  const data1Hit = await res1Hit.json();
  assert.strictEqual(res1Hit.headers.get("X-Cache"), "HIT", "Second call should be cache HIT");
  assert.strictEqual(data1Hit.projects.length, data1.projects.length, "Cached projects length should match");
  console.log("  ✓ Second call returned from Redis cache with X-Cache: HIT");

  // 2. Test GET /api/gallery/[id] (with related projects)
  if (data1.projects.length > 0) {
    const firstProjId = data1.projects[0].id;
    console.log(`\nTest 2: GET /api/gallery/${firstProjId}`);
    const req2 = new NextRequest(`http://localhost:3000/api/gallery/${firstProjId}`);
    const res2 = await getGalleryDetail(req2, { params: Promise.resolve({ id: firstProjId }) });
    assert.strictEqual(res2.status, 200, "Project detail should return 200");
    const data2 = await res2.json();
    assert(data2.project, "Project detail should be returned");
    assert(Array.isArray(data2.relatedProjects), "Related projects should be returned");
    assert.strictEqual(res2.headers.get("X-Cache"), "MISS", "First call should be MISS");
    console.log(`  ✓ First detail call returned project "${data2.project.title}" with ${data2.relatedProjects.length} related projects, X-Cache: MISS`);

    // Second call - cache HIT
    const res2Hit = await getGalleryDetail(req2, { params: Promise.resolve({ id: firstProjId }) });
    assert.strictEqual(res2Hit.headers.get("X-Cache"), "HIT", "Second detail call should be HIT");
    const data2Hit = await res2Hit.json();
    assert.strictEqual(data2Hit.project.id, firstProjId, "Project id should match");
    console.log("  ✓ Project detail & related projects successfully served from cache with X-Cache: HIT");
  }

  // 3. Test GET /api/siswa/[id]
  console.log("\nTest 3: GET /api/siswa/[id] with non-existent id");
  const req3 = new NextRequest("http://localhost:3000/api/siswa/non-existent-student-id");
  const res3 = await getStudentProfile(req3, { params: Promise.resolve({ id: "non-existent-student-id" }) });
  assert.strictEqual(res3.status, 404, "Unknown student should return 404");
  console.log("  ✓ Unknown student properly returned 404");

  // 4. Test GET /api/media/[filename]
  console.log("\nTest 4: GET /api/media/preview-rpl.jpg");
  const req4 = new NextRequest("http://localhost:3000/api/media/preview-rpl.jpg");
  const res4 = await getCachedMedia(req4, { params: Promise.resolve({ filename: "preview-rpl.jpg" }) });
  assert.strictEqual(res4.status, 200, "Media endpoint should find preview-rpl.jpg and return 200");
  assert.strictEqual(res4.headers.get("X-Cache"), "MISS", "First call should be MISS");
  assert.strictEqual(res4.headers.get("Content-Type"), "image/jpeg", "Content type should be image/jpeg");
  console.log("  ✓ Media endpoint served preview-rpl.jpg from disk with X-Cache: MISS");

  // Second call - cache HIT
  const res4Hit = await getCachedMedia(req4, { params: Promise.resolve({ filename: "preview-rpl.jpg" }) });
  assert.strictEqual(res4Hit.status, 200, "Media cache hit should return 200");
  assert.strictEqual(res4Hit.headers.get("X-Cache"), "HIT", "Second media call should be HIT");
  console.log("  ✓ Media endpoint served preview-rpl.jpg from Redis cache with X-Cache: HIT");

  // 5. Test SSRF protection in /api/cache/image
  console.log("\nTest 5: SSRF protection in /api/cache/image");
  const reqSsrfLocal = new NextRequest("http://localhost:3000/api/cache/image?url=http://127.0.0.1:3000/api/admin/pengguna");
  const resSsrfLocal = await getCachedImage(reqSsrfLocal);
  assert.strictEqual(resSsrfLocal.status, 403, "Localhost SSRF attempt should return 403 Forbidden");
  console.log("  ✓ Localhost SSRF attempt properly rejected with 403 Forbidden");

  const reqSsrfDisallowed = new NextRequest("http://localhost:3000/api/cache/image?url=https://malicious-site.com/steal-data.png");
  const resSsrfDisallowed = await getCachedImage(reqSsrfDisallowed);
  assert.strictEqual(resSsrfDisallowed.status, 403, "Disallowed host attempt should return 403 Forbidden");
  console.log("  ✓ Disallowed host attempt properly rejected with 403 Forbidden");

  console.log("\nAll API route integration tests PASSED successfully!");
  process.exit(0);
}

runApiTests().catch((err) => {
  console.error("API test failed:", err);
  process.exit(1);
});
