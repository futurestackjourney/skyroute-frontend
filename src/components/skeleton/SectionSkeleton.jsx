const SectionSkeleton = ({ type = "grid", count = 4 }) => {
  return (
    <section className="padding-x py-4 sm:py-10 bg-creame">
      {/* Heading Skeleton */}
      <div className="mb-10 space-y-3">
        <div className="h-8 w-64 bg-gray-300 animate-pulse rounded-md" />
        <div className="h-4 w-96 bg-gray-300 animate-pulse rounded-md" />
      </div>

      {/* Content Skeleton */}
      {type === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(count)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="flex gap-4 p-4 rounded-xl border border-gray-300 "
              >
                {/* Image Skeleton */}
                <div className="w-1/2 h-40 bg-gray-300 animate-pulse rounded-2xl" />

                {/* Text Skeleton */}
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-3/4 bg-gray-300 animate-pulse rounded" />
                  <div className="h-4 w-full bg-gray-300 animate-pulse rounded" />
                  <div className="h-4 w-1/2 bg-gray-300 animate-pulse rounded" />
                  <div className="h-6 w-24 bg-gray-300 animate-pulse rounded" />
                </div>
              </div>
            ))}
        </div>
      )}

      {type === "list" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {Array(count)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-300 "
              >
                {/* Image Skeleton */}
                <div className="w-1/2 h-50 bg-gray-300 animate-pulse " />
                {/* Text Skeleton */}
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-300 animate-pulse rounded" />
                  <div className="h-3 w-full bg-gray-300 animate-pulse rounded" />
                  <div className="h-10 w-30 bg-gray-300 animate-pulse rounded" />
                </div>
              </div>
            ))}
        </div>
      )}

      {type === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(count)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-4 p-4 rounded-xl border border-gray-300 "
              >
                {/* Image Skeleton */}
                <div className="w-full h-40 bg-gray-300 animate-pulse rounded-2xl" />

                {/* Text Skeleton */}
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-3/4 bg-gray-300 animate-pulse rounded" />
                  <div className="h-4 w-full bg-gray-300 animate-pulse rounded" />
                  <div className="h-4 w-1/2 bg-gray-300 animate-pulse rounded" />
                  <div className="h-6 w-24 bg-gray-300 animate-pulse rounded" />
                </div>
              </div>
            ))}
        </div>
      )}

      {type === "image" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(count)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="w-full h-40 bg-gray-300 animate-pulse rounded-2xl"
              />
            ))}
        </div>
        // <div  className="w-full h-40 bg-gray-300 animate-pulse rounded-2xl"/>
      )}

      {type === "publiclayout" && (
        <div className="flex flex-col space-y-4 h-screen">
          <div>Navbar</div>
          <div>Home</div>
        </div>
      )}
    </section>
  );
};

export default SectionSkeleton;
