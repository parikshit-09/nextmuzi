import prisma from "../../../../../lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpvoteStream = z.object({
  streamId: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession();

  const user = await prisma.user.findFirst({
    where: {
      email: session?.user?.email ?? "",
    },
  });

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const data = UpvoteStream.parse(await req.json());
    await prisma.upvote.create({
      data: {
        userId: user.id,
        streamId: data.streamId,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
