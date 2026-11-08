import Image from "next/image";
import Link from "next/link";

import { type Article, formatArticleDate } from "@/lib/mock/articles";
import { cn } from "@/lib/utils";

type Props = {
  article: Article;
  featured?: boolean;
};

export function ArticleCard({ article, featured = false }: Props) {
  return (
    <Link
      href={`/articulos/${article.slug}`}
      className={cn(
        "group flex h-full overflow-hidden rounded-xl border border-white/10 bg-[#0f0f10] outline-none transition-colors hover:border-white/25 focus-visible:ring-2 focus-visible:ring-[#0071e3]",
        featured ? "flex-col md:flex-row" : "flex-col",
      )}
    >
      <div
        className={cn(
          "relative aspect-[16/9] overflow-hidden bg-[#18181b]",
          featured ? "md:w-1/2 md:shrink-0" : "w-full",
        )}
      >
        <Image
          src={article.cover.src}
          alt={article.cover.alt}
          fill
          unoptimized
          sizes="(min-width: 1280px) 460px, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/55">
          <span className="rounded-full border border-white/15 px-2 py-0.5 text-white/80">
            {article.category}
          </span>
          <span>{formatArticleDate(article.date)}</span>
          <span aria-hidden>·</span>
          <span>{article.readMinutes} min de lectura</span>
        </div>
        <h3 className={cn("font-medium text-white", featured ? "text-xl leading-tight sm:text-2xl" : "text-lg leading-snug")}>
          {article.title}
        </h3>
        <p className="text-[13px] leading-relaxed text-white/70">{article.excerpt}</p>
      </div>
    </Link>
  );
}
