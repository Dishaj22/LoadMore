
import { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

function UserFeed() {
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const {
    data,
    isPending,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["users"],

    queryFn: async ({ pageParam }) => {
      const response = await fetch(
        `https://randomuser.me/api/?results=10&page=${pageParam}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      return response.json();
    },

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      return lastPage.info.page + 1;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isPending) {
    return <h2>Loading users...</h2>;
  }

  if (isError) {
    return <h3>Error: {error.message}</h3>;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "20px auto" }}>
      <h1>User Feed</h1>

      {data.pages.map((page) =>
        page.results.map((user) => (
          <div
            key={user.login.uuid}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              padding: "10px",
              marginBottom: "10px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          >
            <img
              src={user.picture.medium}
              alt={user.name.first}
              style={{ borderRadius: "50%" }}
            />

            <div>
              <h3>
                {user.name.first} {user.name.last}
              </h3>
              <p>{user.email}</p>
              <p>{user.location.country}</p>
            </div>
          </div>
        ))
      )}

      {hasNextPage && (
        <button
          ref={ref}
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          style={{
            marginTop: "20px",
            padding: "10px 16px",
            cursor: "pointer",
          }}
        >
          {isFetchingNextPage ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}

export default UserFeed;
