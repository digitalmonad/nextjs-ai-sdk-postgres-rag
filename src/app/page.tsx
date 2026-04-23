import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/upload");
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      analyze documents with chat interface
    </div>
  );
}
