import { getCache, setCache, deleteCache, invalidateGalleryCache, getFileCache, setFileCache } from "../src/lib/redis";
import assert from "assert";

async function runTests() {
  console.log("=== Testing Redis Cache System ===");

  // 1. Test basic JSON get / set / delete
  console.log("Test 1: Basic JSON get / set / delete");
  const testKey = "test:gallery:sample";
  const testData = { id: "test-123", title: "Test Project", stars: 42 };

  await setCache(testKey, testData, 60);
  const retrieved = await getCache<typeof testData>(testKey);
  assert.deepStrictEqual(retrieved, testData, "Retrieved data should match cached data");
  console.log("  ✓ setCache & getCache passed");

  await deleteCache(testKey);
  const afterDelete = await getCache(testKey);
  assert.strictEqual(afterDelete, null, "Deleted key should return null");
  console.log("  ✓ deleteCache passed");

  // 2. Test file / binary buffer caching
  console.log("\nTest 2: Binary / file caching");
  const fileKey = "cache:media:test-image.png";
  const fileBuffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
  const contentType = "image/png";

  await setFileCache(fileKey, fileBuffer, contentType, 60);
  const retrievedFile = await getFileCache(fileKey);
  assert(retrievedFile !== null, "File should be found in cache");
  assert.strictEqual(retrievedFile.contentType, contentType, "Content type should match");
  assert(retrievedFile.buffer.equals(fileBuffer), "Buffer content should match");
  console.log("  ✓ setFileCache & getFileCache passed");

  // 3. Test pattern invalidation
  console.log("\nTest 3: Gallery cache invalidation");
  await setCache("gallery:list:rpl:test:1", { items: [1, 2, 3] }, 300);
  await setCache("gallery:detail:proj-1", { id: "proj-1" }, 300);
  await setCache("student:profile:stud-1", { id: "stud-1" }, 300);
  await setCache("other:unaffected", { safe: true }, 300);

  await invalidateGalleryCache();

  assert.strictEqual(await getCache("gallery:list:rpl:test:1"), null, "Gallery list cache should be cleared");
  assert.strictEqual(await getCache("gallery:detail:proj-1"), null, "Gallery detail cache should be cleared");
  assert.strictEqual(await getCache("student:profile:stud-1"), null, "Student profile cache should be cleared");
  assert.deepStrictEqual(await getCache("other:unaffected"), { safe: true }, "Unaffected cache should remain");
  console.log("  ✓ invalidateGalleryCache passed");

  // 4. Test TTL expiration
  console.log("\nTest 4: TTL expiration");
  await setCache("test:ttl:fast", { exp: true }, 1); // 1 second TTL
  const immediate = await getCache("test:ttl:fast");
  assert(immediate !== null, "Key should exist immediately");
  await new Promise((resolve) => setTimeout(resolve, 1100));
  const afterTtl = await getCache("test:ttl:fast");
  assert.strictEqual(afterTtl, null, "Key should expire after TTL");
  console.log("  ✓ TTL expiration passed");

  console.log("\nAll Redis cache unit tests PASSED successfully!");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
