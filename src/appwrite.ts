import { Client, Databases, ID, Query } from "appwrite";
import { Game } from "./types/api-response";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(PROJECT_ID);

const database = new Databases(client);

console.log(
  "PROJECT_ID:",
  PROJECT_ID,
  "DATABASE_ID",
  DATABASE_ID,
  "COLLECTION_ID",
  COLLECTION_ID,
  "APPWRITE_ENDPOINT",
  APPWRITE_ENDPOINT
);

export const updateSearchCount = async (searchTerm: string, game: Game) => {
  // 1.Use Appwrite SDK to check if the search term already exists
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", searchTerm),
    ]);

    // 2. If it exists, update the count
    if (result.documents.length > 0) {
      // 2-1. If it exists, update the count
      const documentId = result.documents[0].$id;
      const currentCount = result.documents[0].count || 0;

      await database.updateDocument(DATABASE_ID, COLLECTION_ID, documentId, {
        count: currentCount + 1,
      });

      // 3. If it doesn't exist, create a new document with the search term and count 1
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm,
        count: 1,
        game_id: game.id,
        poster_url: game.background_image,
      });
    }
  } catch (error) {
    console.error("Error checking search term:", error);
  }
};

export const getTrendingGames = async () => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.orderDesc("count"),
      Query.limit(5),
    ]);

    return result.documents;
  } catch (error) {
    console.error("Error fetching trending games:", error);
  }
};
