import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";

import {
  ClerkProvider,
  SignIn,
  SignInButton,
  SignOutButton,
  SignUpButton,
  useUser,
} from "@clerk/nextjs";

import toast from "react-hot-toast";
import { PageLayout } from "../components/layout";

import { PostView } from "~/components/postview";

const toastFailStyle = {
  style: {
    border: "1px solid #9B1C1C",
    padding: "16px",
    color: "#9B1C1C",
  },
  iconTheme: {
    primary: "#9B1C1C",
    secondary: "#FBD5D5",
  },
};

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0], toastFailStyle);
      } else {
        toast.error("fail to post", toastFailStyle);
      }
    },
  });

  if (!user) return null;

  return (
    <div className="flex w-full gap-3 ">
      <Image
        src={user.profileImageUrl}
        alt="Profile Image"
        className="rounded-full"
        width={56}
        height={56}
      />
      <input
        placeholder="type some emojis!"
        className="grow bg-transparent outline-none"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          e.preventDefault();
          if (e.key === "Enter") if (input !== "") mutate({ content: input });
        }}
        disabled={isPosting}
      />
      {input !== "" && !isPosting && (
        <button
          onClick={() => {
            mutate({ content: input });
          }}
          disabled={isPosting}
        >
          Post
        </button>
      )}
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />{" "}
        </div>
      )}
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};
export default function Home() {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();

  //Start fetching data asap
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <PageLayout>
      <div>
        <div className="flex border-b border-slate-400 p-4 ">
          {!isSignedIn && (
            <div className="flex justify-center">
              <SignUpButton />

              <SignInButton />
            </div>
          )}
          {isSignedIn && (
            <div className="flex w-full justify-center">
              <CreatePostWizard />
            </div>
          )}
        </div>
        <Feed />
      </div>
    </PageLayout>
  );
}
