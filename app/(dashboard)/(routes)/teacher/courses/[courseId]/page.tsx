import React from "react";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { Progress } from "@/components/ui/progress";
import { IconBadge } from "@/components/icon-badge";
import {
  Ban,
  CircleDollarSign,
  File,
  LayoutDashboard,
  ListChecks,
} from "lucide-react";

import TitleForm from "./_components/TitleForm";
import DescriptionForm from "./_components/DescriptionForm";
import ImageForm from "./_components/ImageForm";
import CategoryForm from "./_components/CategoryForm";
import PriceForm from "./_components/PriceForm";
import AttachmentForm from "./_components/AttachmentForm";
import ChaptersForm from "./_components/ChaptersForm";
import { Banner } from "@/components/banner";
import { Actions } from "./_components/Actions";


async function CourceId({ params }: { params: { courseId: string } }) {
  const { userId } = auth();

  if (!userId) {
    redirect("/");
  }

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
      userId,
    },
    include: {
      chapters: {
        orderBy: {
          position: "asc",
        },
      },
      attachments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const options = categories.map((category) => ({
    label: category.name,
    value: category.id,
  }));

  if (!course) {
    redirect("/");
  }

  const requiredFields = [
    course.title,
    course.description,
    course.price,
    course.imageUrl,
    course.categoryId,
    course.chapters.some((chapter) => chapter.isPublished),
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const percentComplete = Math.round((completedFields / totalFields) * 100);

  const isCompleted = requiredFields.every(Boolean);

  const completedText = `${completedFields} of ${totalFields} fields completed`;

  return (
    <>
      {!course.isPublished && (
        <Banner label="This course is not published" variant="warning" />
      )}

      <div className="grid px-6 py-2 md:grid-cols-2 gap-4 items-center text-slate-500  ">
        <div>
          <h1 className="text-blue-950 mb-0 text-1xl md:text-3xl font-semibold">
            Setup/Edit Course
          </h1>
          <p className="text-sm">{completedText}</p>
          <p className="text-xs">Progress: {percentComplete + "%"}</p>
          <Progress value={percentComplete} />
        </div>
        <div className="flex items-center justify-start md:justify-end md:pr-6 ">
          <Actions courseId={course.id} disabled={!isCompleted} isPublished={course.isPublished} />
        </div>
      </div>
      <div className="px-6 py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-2">
          <div className="flex flex-col gap-y-4">
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-md">Customize your course</h2>
            </div>
            <TitleForm initialData={course} courseId={course.id} />
            <DescriptionForm initialData={course} courseId={course.id} />
            <ImageForm initialData={course} courseId={course.id} />
            <CategoryForm
              initialData={course}
              courseId={course.id}
              options={options}
            />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-md">Cours chapters</h2>
              </div>
              <ChaptersForm initialData={course} courseId={course.id} />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={CircleDollarSign} />
                <h2 className="text-md">Sell your course</h2>
              </div>
              <PriceForm initialData={course} courseId={course.id} />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={File} />
                <h2 className="text-md">Resousers & Attachments</h2>
              </div>
              <AttachmentForm initialData={course} courseId={course.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CourceId;
