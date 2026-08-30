import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { tutorChat } from "@/lib/agents";
import { COURSES } from "@/lib/courses";

// 课程列表（含个性化排序与进度）
export async function GET(req: NextRequest) {
  const profileId = req.nextUrl.searchParams.get("profile") ?? "";
  const profile = store.getProfile(profileId) ?? store.listProfiles()[0] ?? null;
  const progress = profile ? store.getProgress(profile.id) : null;
  const courses = COURSES.map((c) => {
    const done = progress?.completed[c.id]?.length ?? 0;
    const fitScore = profile
      ? c.fit({
          age: profile.age,
          languageLevel: profile.languageLevel,
          behaviors: profile.behaviors,
          sensory: profile.sensory,
          interests: profile.interests,
        } as never)
      : 1;
    return {
      id: c.id,
      name: c.name,
      enName: c.enName,
      category: c.category,
      brief: c.brief,
      evidence: c.evidence,
      lessonCount: c.lessons.length,
      lessons: c.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        minutes: l.minutes,
        done: progress?.completed[c.id]?.includes(l.id) ?? false,
      })),
      doneCount: done,
      fitScore,
    };
  }).sort((a, b) => b.fitScore - a.fitScore);
  return NextResponse.json({ courses, profile });
}

// 课程互动对话
export async function POST(req: NextRequest) {
  try {
    const { profileId, courseId, lessonId, history, message } = await req.json();
    const profile = store.getProfile(String(profileId ?? ""));
    if (!profile) return NextResponse.json({ error: "请先建立星星档案" }, { status: 404 });
    const course = COURSES.find((c) => c.id === courseId);
    const lesson = course?.lessons.find((l) => l.id === lessonId);
    if (!course || !lesson) return NextResponse.json({ error: "课程不存在" }, { status: 404 });

    const reply = await tutorChat(
      profile,
      { name: course.name, brief: course.brief, evidence: course.evidence },
      { title: lesson.title, keyPoints: lesson.keyPoints, practice: lesson.practice },
      Array.isArray(history) ? history.slice(-10) : [],
      message ? String(message) : undefined
    );
    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// 完成一节课
export async function PUT(req: NextRequest) {
  try {
    const { profileId, courseId, lessonId } = await req.json();
    const p = store.completeLesson(String(profileId), String(courseId), String(lessonId));
    return NextResponse.json({ progress: p });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
