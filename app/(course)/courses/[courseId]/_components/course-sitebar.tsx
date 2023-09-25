import React from "react";
import { auth } from "@clerk/nextjs";
import { Course, Chapter, UserProgress } from "@prisma/client";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { CourseSidebarItem } from "./course-sidebar-item";

interface CourseSitebarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progressCount: number;
}

async function CourseSitebar({ course, progressCount }: CourseSitebarProps) {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const purchases = await db.purchase.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: course.id,
      },
    },
  });

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
      <div className="p-8 flex flex-col border-b">
        <h1 className="font-semibold">{course.title}</h1>
        sadjkdfsjkl;fsdkj
      </div>

      <div className="flex flex-col w-full">
        {course.chapters.map((chapter) => {
          return (
            <CourseSidebarItem
              key={chapter.id}
              id={chapter.id}
              label={chapter.title}
              isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
              courseId={course.id}
              isLocked={!chapter.isFree && !purchases}
            />
          );
        })}
      </div>
    </div>
  );
}

export default CourseSitebar;
