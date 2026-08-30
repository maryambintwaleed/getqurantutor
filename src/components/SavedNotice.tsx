"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check } from "lucide-react";

/**
 * Confirms a save happened, then tidies the ?saved flag out of the URL so a
 * refresh or a shared link doesn't claim something was saved when it wasn't.
 *
 * The cleanup has to wait until after the message has been shown: stripping
 * the flag immediately re-renders the page without it, which unmounts this
 * notice before anyone can read it.
 */
export default function SavedNotice({ message = "Saved" }: { message?: string }) {
  const [visible, setVisible] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      router.replace(pathname, { scroll: false });
    }, 4000);
    return () => clearTimeout(timer);
  }, [router, pathname]);

  if (!visible) return null;

  return (
    <p
      role="status"
      className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-800"
    >
      <Check size={17} /> {message}
    </p>
  );
}
