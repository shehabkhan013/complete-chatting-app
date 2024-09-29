import { getDatabase, onValue, ref, set } from "firebase/database";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import avaterImage from "../../../public/avater.png";
import { ActiveSingle } from "../../fetures/slice/ActiveSingleSlice";
import { toast, ToastContainer } from "react-toastify";
const Friends = () => {
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((user) => user.login.loggedIn);
  const location = useLocation();
  const navigateTo = useNavigate();
  const db = getDatabase();
  const [friends, setFriends] = useState([]);
  const dispatch = useDispatch();

  // Show friend
  useEffect(() => {
    setIsLoading(true);
    const starCountRef = ref(db, "friends");
    onValue(starCountRef, (snapshot) => {
      let data = [];
      snapshot.forEach((item) => {
        if (
          item.val().senderId === user.uid ||
          item.val().receiverId === user.uid
        ) {
          data.push({ ...item.val(), id: item.key });
        }
      });
      setFriends(data);
      setIsLoading(false);
    });
  }, [db, user.uid]);

  const handellSingleChat = (data) => {
    const activeChat = {
      status: "single",
      id: data.receiverId === user.uid ? data.senderId : data.receiverId,
      name: data.receiverId === user.uid ? data.senderName : data.receiverName,
      photoURL:
        data.receiverId === user.uid
          ? data.senderProfile
          : data.receiverProfile,
      isBlocked: data.isBlocked || null,
      blockedBy: data.blockedBy || null,
    };

    dispatch(ActiveSingle(activeChat));
    localStorage.setItem("active", JSON.stringify(activeChat));
  };
  const blockFriend = (data) => {
    const friendId = data.id;
    const isBlocked = data.isBlocked || null;
    const blockedBy = data.blockedBy || null;

    if (!isBlocked || (isBlocked && blockedBy === user.uid)) {
      set(ref(db, `friends/${friendId}`), {
        ...data,
        isBlocked: !isBlocked,
        blockedBy: !isBlocked ? user.uid : data.receiverId,
      });
    } else {
      toast.error("You cannot unblock this friend.");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="px-3 max-h-[93vh] xl:h-[93vh] xl:px-8 pt-3 pb-5 bg-white rounded-[10px] md:shadow-md overflow-y-auto scrollbar-thin scrollbar-webkit">
        <h1 className="text-lg md:text-xl font-interSemiBold text-[#494949]">
          Friends {friends.length ? `(${friends.length})` : null}
        </h1>
        {isLoading ? (
          <>
            <p className="mt-[18px] mb-[18px]">Loading...</p>
          </>
        ) : (
          <>
            {friends.length ? (
              <>
                {friends.map((item, index) => (
                  <div
                    className="flex flex-wrap gap-2 items-center justify-between mt-5 hover:bg-[#e5e5e5] cursor-pointer rounded-md p-3"
                    key={index}
                    onClick={() => handellSingleChat(item)}
                  >
                    <div className="flex items-center gap-x-2">
                      <div className="w-12 h-12 rounded-full bg-black overflow-hidden">
                        {user.uid === item.receiverId ? (
                          <img
                            src={item.senderProfile || avaterImage}
                            alt={item.senderName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={item.receiverProfile || avaterImage}
                            alt={item.receiverName}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <h3 className="text-base lg:text-[18px] xl:text-[23px] font-interMedium text-[#3D3C3C] capitalize">
                        {user.uid === item.receiverId
                          ? item.senderName
                          : item.receiverName}
                      </h3>
                    </div>
                    {location.pathname === "/" && (
                      <div className="text-black cursor-pointer flex gap-x-2 items-center">
                        <button
                          onClick={() => {
                            navigateTo("/messages");
                          }}
                          className="text-white bg-[#4A81D3] focus:outline-none font-medium rounded-lg text-sm px-5 py-2 text-center"
                        >
                          Message
                        </button>
                      </div>
                    )}
                    <div className="text-black cursor-pointer flex gap-x-2 items-center">
                      <button
                        onClick={() => blockFriend(item)}
                        className={`text-white ${
                          item.isBlocked ? "bg-red-500" : "bg-[#4A81D3]"
                        } focus:outline-none font-medium rounded-lg text-sm px-5 py-2 text-center`}
                      >
                        {item.isBlocked && item.blockedBy === user.uid
                          ? "Unblock"
                          : item.isBlocked
                          ? "Blocked"
                          : "Block"}
                      </button>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <p className="mt-[18px] mb-[18px]">No Friends</p>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Friends;
