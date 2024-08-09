import Image from 'next/image';
import Chat from './components/Chat';
import { SignUp } from '@clerk/nextjs'

export default function Home() {
  return (
    <>
              <div className="flex justify-center">
            <SignUp />
        </div>
    </>
  );
}

