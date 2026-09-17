"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createTopicWithRelations,
  updateTopicWithRelations,
} from "@/features/topics/lib/topic-store";
import { parseTopicWrite } from "@/features/topics/lib/topic-write";

export type TopicFormState = {
  error: string;
  field?: string;
} | null;

function revalidateTopicViews(slug: string) {
  revalidatePath("/");
  revalidatePath("/admin/topics");
  revalidatePath("/admin/topics/new");
  revalidatePath(`/admin/topics/${slug}`);
  revalidatePath(`/topics/${slug}`);
}

export async function createTopicAction(
  _prev: TopicFormState,
  formData: FormData,
): Promise<TopicFormState> {
  const result = await createTopicWithRelations(parseTopicWrite(formData));

  if (!result.ok) {
    return { error: result.error.message, field: result.error.field };
  }

  revalidateTopicViews(result.topic.slug);
  redirect("/");
}

export async function updateTopicAction(
  _prev: TopicFormState,
  formData: FormData,
): Promise<TopicFormState> {
  const topicId = String(formData.get("topicId") ?? "");
  const result = await updateTopicWithRelations(
    topicId,
    parseTopicWrite(formData),
  );

  if (!result.ok) {
    return { error: result.error.message, field: result.error.field };
  }

  revalidateTopicViews(result.topic.slug);
  redirect("/admin/topics");
}
