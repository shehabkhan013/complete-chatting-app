import FriendRequest from "../components/FriendRequest";
import Friends from "../components/Friends";
import UserList from "../components/UserList";
const Home = () => {
  return (
    <>
      <div className="grid grid-cols-1 xl:max-h-[100vh] p-8 xl:grid-cols-[2fr,4fr] gap-x-0 gap-y-5 lg:gap-x-5 xl:gap-x-10">
        <div className="mb-5 xl:mb-0 shadow-md rounded-[10px]">
          <UserList />
        </div>
        <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-y-10 md:gap-y-0 gap-x-3 lg:gap-x-5 xl:gap-x-10 xl:pr-10">
          <div className="mb-5 xl:mb-0 w-full h-full bg-white rounded-md">
            <FriendRequest />
          </div>
          <div className="w-full h-full bg-white rounded-md">
            <Friends />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
