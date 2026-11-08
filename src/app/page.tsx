import { PageGreeting } from "@/components/app/layouts/PageGreeting";
import { ArticleCard } from "@/components/app/articles/ArticleCard";
import { listArticles } from "@/lib/mock/articles";

export default function HomePage() {
  const articles = listArticles();
  return (
    <>
      <PageGreeting subtitle="Encuentra toda la información relevante sobre tu participación en ARTBO" />
      <section aria-labelledby="articulos" className="pt-6 lg:pt-[33px]">
        <h2 id="articulos" className="text-2xl font-medium text-white sm:text-3xl">
          Información y fechas
        </h2>
        <ul className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {articles.map((article, index) => (
            <li key={article.slug} className={index === 0 ? "md:col-span-2" : undefined}>
              <ArticleCard article={article} featured={index === 0} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
