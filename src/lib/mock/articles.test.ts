import { describe, expect, it } from "vitest";
import { getArticleBySlug, listArticles, listArticleSlugs } from "./articles";

describe("articles", () => {
  it("has between 4 and 6 articles with unique slugs", () => {
    const slugs = listArticleSlugs();
    expect(slugs.length).toBeGreaterThanOrEqual(4);
    expect(slugs.length).toBeLessThanOrEqual(6);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("finds an article by slug", () => {
    const [first] = listArticles();
    expect(getArticleBySlug(first.slug)?.title).toBe(first.title);
  });

  it("returns undefined for an unknown slug", () => {
    expect(getArticleBySlug("no-existe")).toBeUndefined();
  });

  it("gives every section a unique anchor id and some content", () => {
    for (const article of listArticles()) {
      const ids = article.sections.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const section of article.sections) {
        expect(section.heading.length).toBeGreaterThan(0);
        expect(section.blocks.length).toBeGreaterThan(0);
      }
    }
  });
});
