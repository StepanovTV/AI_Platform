import { db } from "@/lib/db";

export const getProgress = async (
  userId: string,
  courseId: string
): Promise<number> => {
  try {
    const PublishedChapters = await db.chapter.findMany({
      where: {
        courseId,
        isPublished: true,
      },
      select: {
        id: true,
      },
    });

    const PublishedChaptersIds = PublishedChapters.map((chapter) => chapter.id);

    const validCompletedChapters = await db.userProgress.count({
      where: {
        userId,
        chapterId: {
          in: PublishedChaptersIds,
        },
        isCompleted: true,
      },
    });

    const progressProcetage =
      (validCompletedChapters / PublishedChaptersIds.length) * 100;

    return progressProcetage;
  } catch (error) {
    console.error("[GET PROGRESS]", error);
    return 0;
  }
};
