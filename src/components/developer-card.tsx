"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

interface DeveloperCardProps {
  id: string;
  name: string;
  username?: string;
  description?: string;
  avatar?: string;
  appCount: number;
}

export function DeveloperCard({ id, name, username, description, avatar, appCount }: DeveloperCardProps) {
  const { t } = useLanguage();

  return (
    <Link
      href={`/developers/${id}`}
      className="group block p-5 rounded-2xl bg-surface border border-border hover:border-foreground/50 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-elevated border border-border flex-shrink-0">
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg font-bold text-foreground">
              {name[0]}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-foreground transition-colors truncate">
                {name}
              </h3>
              {username && (
                <p className="text-sm text-secondary-text">@{username}</p>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-muted group-hover:text-foreground transition-colors flex-shrink-0" />
          </div>
          {description && (
            <p className="text-sm text-secondary-text mt-2 line-clamp-2">{description}</p>
          )}
          <p className="text-xs text-muted mt-3">
            {appCount} {appCount === 1 ? "app" : "apps"}
          </p>
        </div>
      </div>
    </Link>
  );
}
