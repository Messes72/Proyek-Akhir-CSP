"use client";

import Link from "next/link";
import { useState } from "react";
import LoginModal from "../auth/LoginModal";
import { User } from "@supabase/supabase-js";

interface RestrictedLinkProps {
  user: User | null | undefined;
  href: string;
  className?: string;
  children: React.ReactNode;
}

export default function RestrictedLink({
  user,
  href,
  className,
  children,
}: RestrictedLinkProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setIsLoginModalOpen(true);
    }
  };

  return (
    <>
      <Link href={href} className={className} onClick={handleClick}>
        {children}
      </Link>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
