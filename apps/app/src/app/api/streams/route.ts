// import Prisma from "apps/app/lib/db";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "../../../../lib/db";
import { StreamType } from "@prisma/client";
//@ts-ignore
import youtubesearchapi from "youtube-search-api";

// Validation Schema
const createStreamSchema = z.object({
  creatorId: z.string(),
  url: z
    .string()
    .url()
    .refine((url) => {
      const youtubeRegex =
        /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;
      const spotifyRegex = /^(https?:\/\/)?(open\.)?spotify\.com\/.+$/;
      return youtubeRegex.test(url) || spotifyRegex.test(url);
    }, "URL must be from YouTube or Spotify"),
});

// Extract YouTube Video ID
const extractYouTubeId = (url: string) => {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
};

// Determine the Stream Type
const getStreamType = (url: string) => {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "YOUTUBE";
  if (url.includes("spotify.com")) return "SPOTIFY";
  return "UNKNOWN";
};

export async function POST(request: NextRequest) {
  try {
    // Parse and validate input
    const data = createStreamSchema.parse(await request.json());

    // Extract YouTube ID (if applicable)
    const extractedId = extractYouTubeId(data.url);
    const type = getStreamType(data.url);

    const res = await youtubesearchapi.GetVideoDetails(extractedId);

    const thumbnails = res.thumbnail.thumbnails;
    thumbnails.sort((a: { width: number }, b: { width: number }) =>
      a.width < b.width ? -1 : 1
    );
    console.log(thumbnails);

    // Store data in database
    const stream = await prisma.stream.create({
      data: {
        userId: data.creatorId,
        url: data.url,
        extractedId: extractedId || "",
        type: type as StreamType,
        title: res.title ?? "Thumbnail missing",
        smallImg:
          thumbnails.length > 1
            ? thumbnails[thumbnails.length - 2].url
            : thumbnails[thumbnails.length - 1].url ?? " ",
        largeImg: thumbnails[thumbnails.length - 1].url ?? "",
      },
    });

    // Success Response
    return NextResponse.json({
      message: "Stream added successfully",
      streamId: stream.id,
    });
  } catch (e) {
    console.error("Error while adding a stream: ", e);

    return NextResponse.json(
      {
        message: "Error while adding a stream",
        error: e instanceof Error ? e.message : "Unknown error",
      },
      {
        status: 400,
      }
    );
  }
}
