import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import Mux from "@mux/mux-node";

const { Video } = new Mux(
  process.env.MUX_TOKEN_ID!,
  process.env.MUX_TOKEN_SECRET!
);

export async function DELETE(
  req: Request,
  {
    params: { courseId, chapterId },
  }: { params: { courseId: string; chapterId: string } }
){
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find the course with the ID from the request
    // and the user's ID
    const courseOwner = await db.course.findUnique({
      where: {
        id: courseId,
        userId: userId,
      },
    });

    // If the user doesn't own the course, return a 401
    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const chapter = await db.chapter.delete({
      where: {
        id: chapterId,
        courseId: courseId,
      },
    });

    if (!chapter) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if(chapter.videoUrl){
      const existedMuxData = await db.muxData.findFirst({
        where: {
          chapterId,
        },
      });

      if (existedMuxData) {
        await Video.Assets.del(existedMuxData.assetId);
        await db.muxData.delete({
          where: {
            id: existedMuxData.id,
          },
        });

      }
    }

    const deletedChapter = await db.chapter.delete({
      where: {
        id: chapterId,
      },
    });

    const publishedChaptersInCourse = await db.chapter.findMany({
      where: {
        courseId,
        isPublished: true,
      },
    });

    if(publishedChaptersInCourse.length === 0){
      await db.course.update({
        where: {
          id: courseId,
        },
        data: {
          isPublished: false,
        },
      });
    }

    return NextResponse.json(deletedChapter);


  } catch (error) {
    console.log("[CHAPTER DELETE ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  {
    params: { courseId, chapterId },
  }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find the course with the ID from the request
    // and the user's ID
    const courseOwner = await db.course.findUnique({
      where: {
        id: courseId,
        userId: userId,
      },
    });

    // If the user doesn't own the course, return a 401
    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { isPublished, ...values } = await req.json();

    const chapter = await db.chapter.update({
      where: {
        id: chapterId,
        courseId: courseId,
      },
      data: {
        ...values,
      },
    });

    if (values.videoUrl) {
      const existedMuxData = await db.muxData.findFirst({
        where: {
          chapterId,
        },
      });

      if (existedMuxData) {
        await Video.Assets.del(existedMuxData.assetId);
        await db.muxData.delete({
          where: {
            id: existedMuxData.id,
          },
        });
      }

      const asset = await Video.Assets.create({
        input: values.videoUrl,
        playback_policy: "public",
        test: false
      });


      await db.muxData.create({
        data: {
          chapterId,
          assetId: asset.id,
          playbackId: asset.playback_ids?.[0]?.id,
        },
      });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.log("[CAPTER PATCH ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
