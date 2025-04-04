'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        <button type="button" className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white" onClick={() => signOut()}>{session.user?.name} <span className="ml-auto whitespace-nowrap rounded-full bg-blue-600 px-2.5 py-1 text-xs font-medium text-white">Sign out</span></button>
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn('google')}>Sign in with Google</button>
    </>
  );
}
