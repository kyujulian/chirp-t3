import Head from "next/head";
import Image from "next/image";

import type { GetStaticProps, NextPage } from "next";
// import Link from "next/link";
import { api } from "~/utils/api";
// import { LoadingPage, LoadingSpinner } from "~/components/loading";

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username: "kyujulian",
  });

  if (!data) return <div>404</div>;

  console.log(username);

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-48 border-slate-400 bg-slate-600">
          <Image
            src={data.profilePicture ?? ""}
            width={128}
            height={128}
            alt={`${data.username ?? ""}'s profile pic`}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black"
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl font-bold">{`@${
          data.username ?? ""
        }`}</div>
        <div className="border-b border-slate-400"> </div>
      </PageLayout>
    </>
  );
};

import { appRouter } from "~/server/api/root";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { PageLayout } from "./layout";

//Why not getServerSideProps? There is a simple explanation... Theo's 2:05 ~ 2:10
export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
