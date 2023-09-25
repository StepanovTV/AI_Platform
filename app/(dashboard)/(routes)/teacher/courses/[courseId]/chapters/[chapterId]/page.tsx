import React from "react";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ArrowLeft, Eye, LayoutDashboard, Video } from "lucide-react";
import Link from "next/link";

import { db } from "@/lib/db";
import { Banner } from "@/components/banner";
import { IconBadge } from "@/components/icon-badge";
import CapterTitleForm from "./_components/CapterTitleForm";
import ChapterDescriptionForm from "./_components/ChapterDescriptionForm";
import ChapterAccesssForm from "./_components/ChapterAccesssForm";
import ChapterVideoForm from "./_components/ChapterVideoForm";
import ChapterActions from "./_components/ChaptersActions";

const ChapterIdPage = async ({
  params,
}: {
  params: { courseId: string; chapterId: string };
}) => {
  const { userId } = auth();

  const chapter = await db.chapter.findUnique({
    where: {
      id: params.chapterId,
      courseId: params.courseId,
    },
    include: {
      muxData: true,
    },
  });

  const requiredFields = [
    chapter?.title,
    chapter?.description,
    chapter?.videoUrl,
  ];

  const totalFields = requiredFields.length;
  const compleatedFields = requiredFields.filter(Boolean).length;

  const compleatedText = `${compleatedFields}/${totalFields}`;

  const isCompleated = requiredFields.every(Boolean);

  if (!chapter) {
    return redirect("/");
  }

  if (!userId) {
    return redirect("/");
  }

  return (
    <>
      {!chapter.isPublished && (
        <Banner label="This chapter is not published" variant="warning" />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              href={`/teacher/courses/${params.courseId}`}
              className="flex items-center text-sm hover:opacity-75 transition mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to course setup
            </Link>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">Capter Creation </h1>
                <span className="text-sm text-gray-500">
                  {compleatedText} compleated
                </span>
              </div>
            </div>
          </div>
          <ChapterActions
            disabled={!isCompleated}
            courseId={params.courseId}
            chapterId={params.chapterId}
            isPublished={chapter.isPublished}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 ">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Castomize your chapter</h2>
            </div>
            <CapterTitleForm
              initialData={chapter}
              courseId={params.courseId}
              chapterId={params.chapterId}
            />

            <ChapterDescriptionForm
              initialData={chapter}
              courseId={params.courseId}
              chapterId={params.chapterId}
            />
            <div className="flex items-center gap-x-2 mt-6">
              <IconBadge icon={Eye} />
              Accsses settings
            </div>
            <ChapterAccesssForm
              initialData={chapter}
              courseId={params.courseId}
              chapterId={params.chapterId}
            />
          </div>
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={Video} />
              <h2 className="text-xl">Add a video</h2>
            </div>
            <ChapterVideoForm
              initialData={chapter}
              courseId={params.courseId}
              chapterId={params.chapterId}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChapterIdPage;
