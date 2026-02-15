"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8 mx-auto">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
             <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-primary to-blue-500">I</span>
           </div>
           <Link href="/" className="font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
            Interview Mastery
           </Link>
        </div>

        <nav className="flex items-center gap-4">
            <Link href="/questions">
             <Button variant="ghost" size="sm" className="gap-2">
                Questions
             </Button>
           </Link>
           <Link href="/">
             <Button variant="ghost" size="sm" className="gap-2">
                <Home className="w-4 h-4" /> Home
             </Button>
           </Link>
           <Button variant="outline" size="sm">
             Sign In
           </Button>
        </nav>
      </div>
    </header>
  );
}
