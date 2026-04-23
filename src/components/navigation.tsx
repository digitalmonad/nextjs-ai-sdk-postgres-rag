import { SignInButton, SignOutButton, SignUpButton, Show } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export const Navigation = () => {
  return (
    <nav className="border-b border-[var(--foreground)]/10">
      <div className="flex container max-w-4xl h-10 items-center justify-between px-4  mx-auto">
        <div className="flex items-center gap-4">
          <div className="text-xl font-semibold">The App</div>
          <Show when="signed-in">
            <div className="flex items-center gap-1">
              <Button asChild variant="ghost">
                <a href="/chat">Chat</a>
              </Button>
              <Button asChild variant="ghost">
                <a href="/upload">Documents</a>
              </Button>
            </div>
          </Show>
        </div>
        <div className="flex gap-2">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="ghost">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button>Sign Up</Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <SignOutButton>
              <Button variant="outline">Sign Out</Button>
            </SignOutButton>
          </Show>
        </div>
      </div>
    </nav>
  );
};
