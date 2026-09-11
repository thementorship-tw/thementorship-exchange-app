import { FilterBar } from "./filter-bar";
import type { ListParams } from "./list-params";
import { PostCard } from "./post-card";
import { postTypeLabels, type PostSummary } from "./posts";

/** CHECK: 空列表的畫面設計稿尚未確認，先用單純的說明文字。 */
function EmptyState({ params }: { params: ListParams }) {
  return (
    <p className="flex flex-1 items-center justify-center px-4 text-center text-body text-secondary">
      {params.type === null
        ? "還沒有人發文，成為第一個吧"
        : `目前沒有「${postTypeLabels[params.type]}」的貼文`}
    </p>
  );
}

/** 交流列表；篩選與排序狀態來自網址，這裡只負責呈現。 */
export function PostList({
  posts,
  params,
}: {
  posts: PostSummary[];
  params: ListParams;
}) {
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-5">
      <FilterBar params={params} />

      {posts.length === 0 ? (
        <EmptyState params={params} />
      ) : (
        <ul className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-24 md:landscape:pb-0 lg:pb-0">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
