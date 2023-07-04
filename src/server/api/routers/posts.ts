import { User } from "@clerk/backend/dist/types/api";
import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";



const filterUserForClient = (user: User) => {
  return { id: user.id, username: user.username, profilePicture: user.profileImageUrl };

}

export const postsRouter = createTRPCRouter({
    //preceure is a method that generates the function that your client calls
    //public is the idea that it doesn't need to be autheticator
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100, 
    });

    const users = (await clerkClient.users.getUserList({
      userId : posts.map((post) => post.authorId),
      limit: 100,
    })
    ).map(filterUserForClient);



    return posts.map((post) => {

      const author = users.find((user) => user.id === post.authorId);
      
      if(!author || !author.username) throw new TRPCError({code: "INTERNAL_SERVER_ERROR", message: "Author not found"});

      return {
        post, 
        author: {
          ...author,
          username: author.username
        },
      }
    });


  }),
});