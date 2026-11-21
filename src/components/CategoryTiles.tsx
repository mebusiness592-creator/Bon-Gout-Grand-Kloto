import Link from "next/link";
import type { Category } from "@/lib/types";

export function CategoryTiles({ cats, base, leaf }: { cats: Category[]; base: string; leaf?: boolean }) {
  return (
    <div className="tiles">
      {cats.map((c) => (
        <Link key={c._id} href={base + c._id} className={`tile ${leaf ? "leaf" : ""}`}>
          {c.image && <img src={c.image} alt="" loading="lazy" />}
          <span>{c.name}</span>
        </Link>
      ))}
    </div>
  );
}
