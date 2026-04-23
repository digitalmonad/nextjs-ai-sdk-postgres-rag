"use server";

import { PDFParse } from "pdf-parse";
import { db } from "@/lib/db";
import { documents } from "@/lib/schema";
import { generateEmbeddings } from "@/lib/embeddings";
import { chunkContent } from "@/lib/chunking";

export async function processPdfFile(formData: FormData) {
  try {
    const file = formData.get("pdf") as File;

    // Convert File to Buffer and extract text
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();

    if (!result.text || result.text.trim().length === 0) {
      return {
        success: false,
        error: "No text found in PDF",
      };
    }

    // Chunk the text
    const chunks = await chunkContent(result.text);

    // Generate embeddings
    const embeddings = await generateEmbeddings(chunks);

    // Store in database
    const records = chunks.map((chunk, index) => ({
      content: chunk,
      embedding: embeddings[index],
    }));

    await db.insert(documents).values(records);

    return {
      success: true,
      message: `Created ${records.length} searchable chunks`,
    };
  } catch (error) {
    console.error("PDF processing error:", error);
    return {
      success: false,
      error: "Failed to process PDF",
    };
  }
}

export async function clearDocuments() {
  try {
    await db.delete(documents);
    return { success: true };
  } catch (error) {
    console.error("Clear documents error:", error);
    return { success: false, error: "Failed to clear documents" };
  }
}
