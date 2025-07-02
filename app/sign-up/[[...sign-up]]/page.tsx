import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div style={{ marginTop: "100px", display: "flex", justifyContent: "center" }}>
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
    </div>
  );
}
