import PostCard from "../../components/organisms/PostCard";
import { useFeed } from "../../hooks/useFeed";


const Home = () => {
  const { data, isLoading } = useFeed();

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {data?.posts?.map((post: any) => (
        <PostCard
          key={post._id}
          post={post}
        />
      ))}
    </div>
  );
};

export default Home;
