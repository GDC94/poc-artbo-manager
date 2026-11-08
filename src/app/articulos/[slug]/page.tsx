import Image from "next/image";
import { notFound } from "next/navigation";

import { ArticleReveal } from "@/components/app/articles/ArticleReveal";
import { ArticleSources } from "@/components/app/articles/ArticleSources";
import { ArticleToc } from "@/components/app/articles/ArticleToc";
import { PageGreeting } from "@/components/app/layouts/PageGreeting";
import { Breadcrumb } from "@/components/app/shared/Breadcrumb";
import { formatArticleDate, getArticleBySlug, listArticleSlugs } from "@/lib/mock/articles";

/** All params are prerendered by `generateStaticParams`; opt out of the dev-only instant-shell check. */
export const instant = false;

export function generateStaticParams() {
  return listArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/articulos/[slug]">) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  return { title: article ? `${article.title} · ARTBO` : "ARTBO" };
}

export default async function ArticlePage({ params }: PageProps<"/articulos/[slug]">) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <ArticleReveal>
      <PageGreeting
        subtitle="Encuentra toda la información relevante sobre tu participación en ARTBO"
        breadcrumb={<Breadcrumb items={[{ label: "Información y fechas", href: "/" }, { label: article.title }]} />}
      />

      <article className="pt-6 lg:pt-[33px]">
        <header className="max-w-[640px]">
          <h1 className="text-2xl font-medium leading-[1.1] lg:text-[29px] tracking-[-0.01em] text-white">
            {article.title}
          </h1>
          <p className="mt-4 max-w-[440px] text-xs leading-[1.45] text-white/80">
            {article.intro}
          </p>
          <p className="mt-3 text-xs text-white/45">
            {article.category} · {formatArticleDate(article.date)} · {article.readMinutes} min de lectura
          </p>
        </header>

        <div className="relative mt-6 aspect-[900/500] lg:mt-8 overflow-hidden rounded-xl bg-[#18181b]">
          <Image
            src={article.cover.src}
            alt={article.cover.alt}
            fill
            priority
            unoptimized
            sizes="(min-width: 1280px) 900px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="mt-6 grid gap-6 lg:mt-8 lg:gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,9fr)]">
          <aside className="min-w-0">
            <ArticleToc sections={article.sections.map(({ id, heading }) => ({ id, heading }))} />
          </aside>

          <div className="min-w-0 space-y-9">
            {article.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-4">
                <h2 className="text-[15px] font-semibold text-white">{section.heading}</h2>
                <div className="mt-3 space-y-3 text-[13px] leading-relaxed text-white/85">
                  {section.blocks.map((block, index) =>
                    block.type === "p" ? (
                      <p key={index}>{block.text}</p>
                    ) : (
                      <ul key={index} className="list-disc space-y-1 pl-5">
                        {block.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ),
                  )}
                </div>
              </section>
            ))}

            {article.sources.length > 0 ? <ArticleSources sources={article.sources} /> : null}
          </div>
        </div>
      </article>
    </ArticleReveal>
  );
}
