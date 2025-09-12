// pages/sign-in/[[...index]].tsx
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div style={{ marginTop: '100px', display: 'flex', justifyContent: 'center' }}>
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
    </div>
  );
}
