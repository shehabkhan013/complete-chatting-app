import { SmileIcon } from "../../svg/Smile";
import { GalleryIcon } from "../../svg/Gallery";
import { useSelector } from "react-redux";
import avaterImage from "../../../public/avater.png";
import { getDatabase, onValue, push, ref, set } from "firebase/database";
import {
  getDownloadURL,
  getStorage,
  ref as Ref,
  uploadBytesResumable,
} from "firebase/storage";
import { useEffect, useRef, useState } from "react";
import moment from "moment";
import Lottie from "lottie-react";

import loadingAnimation from "../../animation/loading.json";
import sadEmoji from "../../animation/sadEmoji.json";
import EmojiPicker from "emoji-picker-react";
import { StopRecodingIcon } from "../../svg/StopRecording";
import { StartRecodingIcon } from "../../svg/StartRecoding";

const Chatting = () => {
  const user = useSelector((state) => state.login.loggedIn);
  const singleFriend = useSelector((state) => state.active.active);
  const [message, setMessage] = useState("");
  const [singleMessage, setSingleMessage] = useState([]);
  const db = getDatabase();
  const [show, setShow] = useState(false);
  const storage = getStorage();

  const chooseFile = useRef(null);
  const scrollRef = useRef();

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const audioChunks = useRef([]);

  const sendMessage = () => {
    if (singleFriend?.status === "single" && message) {
      set(push(ref(db, "singleMessage")), {
        senderId: user.uid,
        senderName: user.displayName,
        receiverId: singleFriend.id,
        receiverName: singleFriend.name,
        message: message,
        date: new Date().toISOString(),
      }).then(() => {
        setMessage("");
        setAudioBlob(null);
        setShow(false);
      });
    } else {
      console.log("Message is empty");
    }
  };

  const formatDate = (date) => {
    const messageDate = moment(date);
    const now = moment();
    if (now.diff(messageDate, "minutes") < 60) {
      return messageDate.fromNow();
    } else if (now.diff(messageDate, "hours") < 24) {
      return messageDate.fromNow();
    } else if (now.isSame(messageDate, "year")) {
      return messageDate.format("MMMM Do");
    } else {
      return messageDate.format("MMMM Do YYYY");
    }
  };

  useEffect(() => {
    if (singleFriend?.status === "single") {
      onValue(ref(db, "singleMessage"), (snapshot) => {
        const data = [];
        snapshot.forEach((item) => {
          if (
            (item.val().senderId === user.uid &&
              item.val().receiverId === singleFriend.id) ||
            (item.val().receiverId === user.uid &&
              item.val().senderId === singleFriend.id)
          ) {
            data.push(item.val());
          }
        });
        setSingleMessage(data);
      });
    }
  }, [db, singleFriend?.id]);

  const handellEmojiSelect = ({ emoji }) => {
    setMessage(message + emoji);
    setShow(false);
  };

  const handellImageUpload = (e) => {
    const imgFile = e.target.files[0];
    const storageRef = Ref(
      storage,
      `${user.displayName} = sendImageMessage/ ${imgFile.name}`
    );
    const uploadTask = uploadBytesResumable(storageRef, imgFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.log(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          set(push(ref(db, "singleMessage")), {
            senderId: user.uid,
            senderName: user.displayName,
            receiverId: singleFriend.id,
            receiverName: singleFriend.name,
            message: message,
            image: downloadURL,
            date: new Date().toISOString(),
          }).then(() => {
            setMessage("");
            setAudioBlob(null);
          });
        });
      }
    );
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  const handelSendButton = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const newRecorder = new MediaRecorder(stream);
        newRecorder.ondataavailable = (event) => {
          audioChunks.current.push(event.data);
        };
        newRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks.current, {
            type: "audio/webm",
          });
          setAudioBlob(audioBlob);
          audioChunks.current = [];
        };
        setRecorder(newRecorder);
        newRecorder.start();
        setIsRecording(true);
      })
      .catch((error) => console.error("Error accessing audio stream:", error));
  };

  const stopRecording = () => {
    if (recorder) {
      recorder.stop();
      setIsRecording(false);
    }
  };

  const uploadAndSend = () => {
    if (audioBlob) {
      const audioFileName = `voice_messages/${
        user.displayName
      }_${Date.now()}.webm`;
      const storageRef = Ref(storage, audioFileName);

      const uploadTask = uploadBytesResumable(storageRef, audioBlob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Audio upload is ${progress}% done`);
        },
        (error) => {
          console.error("Audio upload failed:", error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            set(push(ref(db, "singleMessage")), {
              senderId: user.uid,
              senderName: user.displayName,
              receiverId: singleFriend.id,
              receiverName: singleFriend.name,
              audio: downloadURL,
              date: new Date().toISOString(),
            }).then(() => {
              setAudioBlob(null);
              console.log("Voice message sent!");
            });
          });
        }
      );
    }
  };
  console.log("singleFriend", singleFriend);
  console.log("user.id ", user.id);
  return (
    <>
      {singleFriend.isBlocked ? (
        singleFriend.blockedBy === singleFriend.id ? (
          <div className="w-[100%] h-[93vh] rounded-md shadow-md bg-white overflow-hidden py-3 px-5 flex flex-col items-center justify-center min-h-80">
            <h2 className="text-center font-fontBold text-xl">
              You are blocked by {singleFriend.name}
            </h2>
            <div className="w-40 h-40 rounded-full overflow-hidden mt-5">
              <Lottie animationData={sadEmoji} loop={true} />
            </div>
          </div>
        ) : singleFriend.blockedBy === user.uid ? (
          <div className="w-[100%] h-[93vh] rounded-md shadow-md bg-white overflow-hidden py-3 px-5 flex flex-col items-center justify-center min-h-80">
            <h2 className="text-center font-fontBold text-xl">
              You blocked {singleFriend.name}
            </h2>
            <div className="w-40 h-40 rounded-full overflow-hidden mt-5">
              <Lottie animationData={sadEmoji} loop={true} />
            </div>
          </div>
        ) : null
      ) : singleFriend?.status ? (
        <>
          <div className="w-[100%] max-h-[93vh] bg-white rounded-md shadow-md overflow-hidden">
            <div className="py-4 bg-[#F9F9F9] px-6">
              <div className="flex items-center gap-x-2">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    src={singleFriend?.photoURL || avaterImage}
                    alt={singleFriend?.name || "Please Select a Friend"}
                  />
                </div>
                <div>
                  <span className="text-blcak font-interMedium capitalize text-base md:text-[20px]">
                    {singleFriend?.name || "Please Select a Friend"}
                  </span>
                </div>
              </div>
            </div>
            <div className="h-[calc(93vh-164px)] bg-white px-6 pb-2 overflow-y-scroll scrollbar-thin scrollbar-webkit">
              {singleFriend?.status === "single"
                ? singleMessage.map((item) => (
                    <>
                      {item?.senderId === user?.uid ? (
                        <div
                          className="w-[100%] xl:w-[60%] ml-auto"
                          key={item.senderId}
                          ref={scrollRef}
                        >
                          <div className="flex items-center gap-x-3 my-3">
                            <div className="w-full ml-auto text-right">
                              {item?.image && (
                                <img
                                  src={item?.image}
                                  alt=""
                                  className="w-full h-full object-cover rounded-md"
                                />
                              )}
                              {item?.message && (
                                <p className="text-white font-reguler text-sm bg-slate-500 px-4 py-2 rounded-md inline-block">
                                  {item.message}
                                </p>
                              )}
                              {item?.audio && (
                                <audio controls>
                                  <source src={item?.audio} type="audio/webm" />
                                  Your browser does not support the audio
                                  element.
                                </audio>
                              )}
                            </div>
                            <div className="w-8 h-8 rounded-full overflow-hidden">
                              <img
                                className="w-full h-full object-cover"
                                src={user?.photoURL || avaterImage}
                                alt={
                                  user?.displayName || "Please Select a Friend"
                                }
                              />
                            </div>
                          </div>
                          <span className="text-xs text-slate-500 block ml-auto text-right">
                            {formatDate(item?.date)}
                          </span>
                        </div>
                      ) : (
                        <div
                          className="w-[100%] xl:w-[60%] mr-auto"
                          key={item.receiverId}
                        >
                          <div className="flex items-center gap-x-3 my-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden">
                              <img
                                className="w-full h-full object-cover"
                                src={singleFriend?.photoURL || avaterImage}
                                alt={
                                  singleFriend?.name || "Please Select a Friend"
                                }
                              />
                            </div>
                            <div className="w-full ml-auto">
                              {item?.image && (
                                <img
                                  src={item?.image}
                                  alt=""
                                  className="w-full h-full object-cover rounded-md"
                                />
                              )}
                              {item?.message && (
                                <p className="text-black font-reguler text-sm bg-[#e5e5e5] px-4 py-2 rounded-md inline-block">
                                  {item?.message}
                                </p>
                              )}

                              {item?.audio && (
                                <audio controls>
                                  <source src={item?.audio} type="audio/webm" />
                                  Your browser does not support the audio
                                  element.
                                </audio>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-slate-500 block mr-auto">
                            {formatDate(item?.date)}
                          </span>
                        </div>
                      )}
                    </>
                  ))
                : "No Message Found"}
            </div>

            <div className="py-1.5 md:py-4 px-1.5 md:px-8">
              <div className="bg-[#F5F5F5] rounded-md mx-auto py-1.5 md:py-3 px-1.5 md:px-0 grid grid-cols-[110px_auto_88px] items-center gap-x-0.5 md:gap-x-3">
                <div className="flex items-center md:justify-end gap-x-0.5 md:gap-x-3">
                  <div className="relative cursor-pointer">
                    {isRecording ? (
                      <div onClick={stopRecording}>
                        <StopRecodingIcon />
                      </div>
                    ) : (
                      <div onClick={startRecording}>
                        <StartRecodingIcon />
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    {show ? (
                      <div className="absolute bottom-11 -left-3">
                        <EmojiPicker onEmojiClick={handellEmojiSelect} />
                      </div>
                    ) : (
                      ""
                    )}

                    <div
                      className="cursor-pointer"
                      onClick={() => setShow((prev) => !prev)}
                    >
                      <SmileIcon />
                    </div>
                  </div>
                  <div
                    className="cursor-pointer"
                    onClick={() => chooseFile.current.click()}
                  >
                    <GalleryIcon />
                  </div>
                  <input
                    onChange={handellImageUpload}
                    ref={chooseFile}
                    hidden
                    type="file"
                    name=""
                    id=""
                  />
                </div>
                {isRecording && (
                  <div>
                    <Lottie
                      animationData={loadingAnimation}
                      loop={true}
                      className="h-[30px] w-[100px]"
                    />
                  </div>
                )}
                {audioBlob && !isRecording && (
                  <div>Please Send Your Voice Record ...</div>
                )}
                {!isRecording && !audioBlob && (
                  <input
                    type="text"
                    placeholder="Type a message"
                    className="outline-none bg-[#F5F5F5]"
                    onChange={(e) => setMessage(e.target.value)}
                    value={message}
                    onKeyUp={handelSendButton}
                  />
                )}

                <div className="md:pr-2">
                  {audioBlob ? (
                    <button
                      onClick={uploadAndSend}
                      className="w-full py-2 bg-[#4A81D3] text-white rounded-md font-fontBold text-sm"
                    >
                      Send
                    </button>
                  ) : (
                    <button
                      onClick={sendMessage}
                      className="w-full py-2 bg-[#4A81D3] text-white rounded-md font-fontBold text-sm"
                    >
                      Send
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="w-[100%] bg-white overflow-hidden py-3 px-5 flex flex-col items-center justify-center min-h-80">
            <h2 className="text-center font-fontBold text-xl">
              Please Select a Friend
            </h2>
            <div className="w-40 h-40 rounded-full overflow-hidden mt-5">
              <Lottie animationData={loadingAnimation} loop={true} />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Chatting;
