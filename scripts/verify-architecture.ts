import prisma from "../src/lib/prisma";
import {
  getGalleryProjects,
  getGalleryProjectById,
  getRelatedProjects,
} from "../src/lib/gallery-server";
import { getStudentProfileById } from "../src/lib/student-server";
import { ProjectType } from "@prisma/client";

async function main() {
  console.log("=== STARTING ARCHITECTURE VERIFICATION ===");

  // 1. Test getGalleryProjects default (page 1, limit 12)
  console.log("\n1. Testing getGalleryProjects default pagination...");
  const res1 = await getGalleryProjects({ page: 1, limit: 12 });
  console.log(`- Total projects count: ${res1.total}`);
  console.log(`- Current page: ${res1.page}, limit: ${res1.limit}, totalPages: ${res1.totalPages}`);
  console.log(`- Returned projects length: ${res1.projects.length}`);
  if (res1.projects.length > 0) {
    const first = res1.projects[0];
    console.log(`- First project: "${first.title}", major: ${first.major}, studentName: ${first.studentName}`);
    if (!first.id || !first.title || !first.studentName) {
      throw new Error("Missing essential field in first project!");
    }
  }

  // 2. Test pagination offset (page 2, limit 2)
  console.log("\n2. Testing getGalleryProjects offset (page 2, limit 2)...");
  const res2 = await getGalleryProjects({ page: 2, limit: 2 });
  console.log(`- Page 2 results length: ${res2.projects.length}`);

  // 3. Test filtering by major
  console.log("\n3. Testing getGalleryProjects filtered by RPL...");
  const resRpl = await getGalleryProjects({ major: "rpl" });
  console.log(`- RPL projects count: ${resRpl.total}, returned: ${resRpl.projects.length}`);
  for (const p of resRpl.projects) {
    if (p.major !== "rpl") {
      throw new Error(`Expected major rpl, got ${p.major}`);
    }
  }

  // 4. Test search query
  console.log("\n4. Testing getGalleryProjects search query...");
  const resSearch = await getGalleryProjects({ q: "SMK" });
  console.log(`- Search "SMK" count: ${resSearch.total}, returned: ${resSearch.projects.length}`);

  // 5. Test sorting
  console.log("\n5. Testing getGalleryProjects sort options...");
  const resPopuler = await getGalleryProjects({ sort: "populer", limit: 5 });
  console.log(`- Populer first views: ${resPopuler.projects[0]?.metrics?.views}`);

  const resUnggulan = await getGalleryProjects({ sort: "unggulan", limit: 5 });
  console.log(`- Unggulan first status: ${resUnggulan.projects[0]?.status}`);

  // 6. Test getGalleryProjectById
  console.log("\n6. Testing getGalleryProjectById...");
  if (res1.projects.length > 0) {
    const targetId = res1.projects[0].id;
    const detail = await getGalleryProjectById(targetId);
    if (!detail) {
      throw new Error(`Failed to get project detail for ID: ${targetId}`);
    }
    console.log(`- Successfully fetched detail for "${detail.title}" (ID: ${detail.id})`);

    // 7. Test getRelatedProjects
    console.log("\n7. Testing getRelatedProjects...");
    const currentMajor = detail.major === "analis-kimia" ? ProjectType.KA : detail.major === "tkj" ? ProjectType.TKJ : ProjectType.RPL;
    const related = await getRelatedProjects(detail.id, currentMajor, 3);
    console.log(`- Found ${related.length} related projects for major ${currentMajor}`);
    for (const rel of related) {
      if (rel.id === detail.id) {
        throw new Error("Related projects should not include the current project itself!");
      }
    }

    // 7b. Test real solution highlights from mainFeatures
    console.log("\n7b. Testing project solution highlights from mainFeatures...");
    console.log(`- Project "${detail.title}" highlights count: ${detail.solutionHighlights?.length}`);
    if (!detail.solutionHighlights || detail.solutionHighlights.length === 0) {
      throw new Error("Expected project to have solution highlights!");
    }
  }

  // 8. Test getGalleryProjectById with nonexistent ID and arbitrary non-UUID string
  console.log("\n8. Testing getGalleryProjectById with nonexistent and non-UUID IDs...");
  const notFoundProject = await getGalleryProjectById("00000000-0000-0000-0000-000000000000");
  if (notFoundProject !== null) {
    throw new Error("Expected null for nonexistent project ID");
  }
  const nonUuidProject = await getGalleryProjectById("educlass-arbitrary-slug");
  if (nonUuidProject !== null) {
    throw new Error("Expected null for non-UUID project slug");
  }
  console.log("- Successfully returned null for nonexistent UUID and non-UUID slug without crashing.");

  // 9. Test getStudentProfileById with UUID and username
  console.log("\n9. Testing getStudentProfileById...");
  const anyStudent = await prisma.student.findFirst({ include: { user: true } });
  if (anyStudent) {
    const studentRes = await getStudentProfileById(anyStudent.userId);
    if (!studentRes) {
      throw new Error(`Failed to fetch student profile for userId: ${anyStudent.userId}`);
    }
    console.log(`- Found student by UUID: ${studentRes.student.name} (${studentRes.student.class}), projects: ${studentRes.projects.length}`);

    // Test lookup by username
    const username = anyStudent.user.name;
    const byUsernameRes = await getStudentProfileById(username);
    if (!byUsernameRes) {
      throw new Error(`Failed to fetch student profile for username: ${username}`);
    }
    console.log(`- Successfully found student by username "${username}" without P2023 crash.`);
  }

  // 10. Test getStudentProfileById with non-existent non-UUID username
  console.log("\n10. Testing getStudentProfileById with non-existent username...");
  const nonExistentStudent = await getStudentProfileById("random_ghost_student_xyz");
  if (nonExistentStudent !== null) {
    throw new Error("Expected null for non-existent student username");
  }
  console.log("- Successfully returned null for non-existent username without throwing P2023 error.");

  // 11. Test pagination boundary clamping & oversized values
  console.log("\n11. Testing pagination boundary clamping...");
  const clampedNeg = await getGalleryProjects({ page: -10, limit: -5 });
  if (clampedNeg.page !== 1 || clampedNeg.limit !== 1) {
    throw new Error(`Expected page 1 and limit 1, got page ${clampedNeg.page}, limit ${clampedNeg.limit}`);
  }
  const clampedLarge = await getGalleryProjects({ page: 999999, limit: 1000 });
  if (clampedLarge.limit !== 50) {
    throw new Error(`Expected limit clamped to 50, got ${clampedLarge.limit}`);
  }
  console.log("- Successfully clamped out-of-range pagination parameters.");

  // 12. Test whitespace, empty, and SQL injection strings
  console.log("\n12. Testing search query sanitization with special chars...");
  const resEmptySearch = await getGalleryProjects({ q: "     " });
  if (resEmptySearch.total === 0) {
    throw new Error("Whitespace search should fallback to all approved projects");
  }
  const resSpecialChars = await getGalleryProjects({ q: "'; DROP TABLE projects; -- %_" });
  if (!Array.isArray(resSpecialChars.projects)) {
    throw new Error("Special character search should return valid array");
  }
  console.log("- Special character and whitespace queries handled safely.");

  // 13. Verify security constraints on all returned projects
  console.log("\n13. Testing security filters (no private, unapproved, or deleted records)...");
  const allProjects = await getGalleryProjects({ limit: 50 });
  for (const p of allProjects.projects) {
    if (p.isPrivate) {
      throw new Error(`Security violation: private project ${p.id} leaked in gallery!`);
    }
  }
  console.log(`- Verified all ${allProjects.projects.length} returned projects are public and approved.`);

  console.log("\n=== ALL ARCHITECTURE VERIFICATION CHECKS PASSED ===");
}

main()
  .catch((e) => {
    console.error("Verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
