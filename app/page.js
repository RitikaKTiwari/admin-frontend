"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminLoggedIn } from './_services/api/admin';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isAdminLoggedIn()) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return null;
}