import {
  assertSucceeds,
  assertFails,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, setDoc, getDoc, deleteDoc, collection, addDoc } from "firebase/firestore";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "cryoutnow-6ce3d",
    firestore: {
      rules: `
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            function isAuthenticated() {
              return request.auth != null;
            }
            
            function isOwner(userId) {
              return request.auth.uid == userId;
            }

            match /users/{userId} {
              allow read: if isAuthenticated();
              allow create: if isAuthenticated() && isOwner(userId);
              allow update, delete: if isOwner(userId);
            }

            match /prayerRequests/{requestId} {
              allow read: if true;
              allow create: if isAuthenticated();
              allow update, delete: if isAuthenticated() && 
                isOwner(resource.data.userId);

              match /comments/{commentId} {
                allow read: if true;
                allow create: if isAuthenticated();
                allow update, delete: if isAuthenticated() && 
                  isOwner(resource.data.userId);
              }
            }
          }
        }
      `,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("Prayer Request Rules", () => {
  it("allows anyone to read prayer requests", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const docRef = doc(db, "prayerRequests", "test-request");
    await assertSucceeds(getDoc(docRef));
  });

  it("requires authentication to create prayer requests", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const colRef = collection(db, "prayerRequests");
    await assertFails(
      addDoc(colRef, {
        title: "Test Prayer Request",
        description: "Test description",
        userId: "user123",
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 0,
        tags: [],
      })
    );
  });

  it("allows authenticated users to create prayer requests", async () => {
    const userId = "user123";
    const db = testEnv.authenticatedContext(userId).firestore();
    const colRef = collection(db, "prayerRequests");
    await assertSucceeds(
      addDoc(colRef, {
        title: "Test Prayer Request",
        description: "Test description",
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 0,
        tags: [],
      })
    );
  });

  it("prevents users from updating other users' prayer requests", async () => {
    const ownerId = "owner123";
    const otherUserId = "other456";
    
    // Create a prayer request as the owner
    const ownerDb = testEnv.authenticatedContext(ownerId).firestore();
    const docRef = doc(ownerDb, "prayerRequests", "test-request");
    await setDoc(docRef, {
      title: "Original Title",
      description: "Original description",
      userId: ownerId,
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      tags: [],
    });

    // Try to update as another user
    const otherDb = testEnv.authenticatedContext(otherUserId).firestore();
    await assertFails(
      setDoc(doc(otherDb, "prayerRequests", "test-request"), {
        title: "Modified Title",
      }, { merge: true })
    );
  });
});

describe("Comment Rules", () => {
  const requestId = "test-request";
  const userId = "user123";

  beforeEach(async () => {
    // Create a test prayer request
    const db = testEnv.authenticatedContext(userId).firestore();
    await setDoc(doc(db, "prayerRequests", requestId), {
      title: "Test Prayer Request",
      description: "Test description",
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      tags: [],
    });
  });

  it("allows anyone to read comments", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const commentRef = doc(db, "prayerRequests", requestId, "comments", "test-comment");
    await assertSucceeds(getDoc(commentRef));
  });

  it("requires authentication to create comments", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const commentRef = doc(db, "prayerRequests", requestId, "comments", "test-comment");
    await assertFails(
      setDoc(commentRef, {
        text: "Test comment",
        userId: "anonymous",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );
  });

  it("allows authenticated users to create comments", async () => {
    const db = testEnv.authenticatedContext(userId).firestore();
    const commentRef = doc(db, "prayerRequests", requestId, "comments", "test-comment");
    await assertSucceeds(
      setDoc(commentRef, {
        text: "Test comment",
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );
  });
});

describe("User Profile Rules", () => {
  const userId = "user123";

  it("requires authentication to read user profiles", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const userRef = doc(db, "users", userId);
    await assertFails(getDoc(userRef));
  });

  it("allows users to read their own profile", async () => {
    const db = testEnv.authenticatedContext(userId).firestore();
    const userRef = doc(db, "users", userId);
    await assertSucceeds(getDoc(userRef));
  });

  it("allows users to update their own profile", async () => {
    const db = testEnv.authenticatedContext(userId).firestore();
    const userRef = doc(db, "users", userId);
    await assertSucceeds(
      setDoc(userRef, {
        displayName: "Updated Name",
        email: "test@example.com",
        updatedAt: new Date(),
      })
    );
  });

  it("prevents users from updating other users' profiles", async () => {
    const otherUserId = "other456";
    const db = testEnv.authenticatedContext(otherUserId).firestore();
    const userRef = doc(db, "users", userId);
    await assertFails(
      setDoc(userRef, {
        displayName: "Malicious Update",
        email: "hacked@example.com",
        updatedAt: new Date(),
      })
    );
  });
}); 
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('Firestore Security Rules', () => {
  const testEnv = await initializeTestEnvironment({
    projectId: 'demo-' + Date.now(),
    firestore: { rules: fs.readFileSync('firestore.rules', 'utf8') }
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it('denies unauthorized prayer request reads', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(db.collection('prayerRequests').get());
  });

  it('allows authorized prayer request reads', async () => {
    const db = testEnv.authenticatedContext('user1').firestore();
    await assertSucceeds(db.collection('prayerRequests').get());
  });

  it('enforces data validation on prayer request creation', async () => {
    const db = testEnv.authenticatedContext('user1').firestore();
    await assertFails(db.collection('prayerRequests').add({
      // Missing required fields
    }));
  });
});
