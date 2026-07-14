import CategoryTabs from "@/components/category-tabs";
import Videogrid from "@/components/videogrid";

export default function Home() {
  return (
    <main className="flex-1 p-4">
      <CategoryTabs />

      <section className="mt-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
            Latest Videos
          </h1>
          <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Browse the newest video uploads and explore trending channels.
          </p>
        </div>
      </section>

      <div className="mt-8">
        <Videogrid />
      </div>
    </main>
  );
}
