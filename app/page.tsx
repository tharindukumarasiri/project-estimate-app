import { Card } from "@tremor/react";
import Link from "next/link";
import { RiCommunityLine, RiWindowLine } from "@remixicon/react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start p-24">
      <Card className="grid grid-cols-2 mx-auto max-w-5xl mt-14 py-28">
        <Link
          href={"/software-project"}
          className="mx-auto max-w-xs h-full w-full"
        >
          <Card
            decoration="top"
            decorationColor="orange"
            className="text-center text-gray-700 h-full flex flex-col justify-center items-center hover:bg-gray-600 group transition-all ease-in"
          >
            <RiWindowLine size={100} className="group-hover:text-white mb-5" />
            <p className="text-3xl  font-semibold group-hover:text-white">
              Software Project
            </p>
          </Card>
        </Link>
        <Link
          href={"/construction-project"}
          className="mx-auto max-w-xs h-full"
        >
          <Card
            decoration="top"
            decorationColor="yellow"
            className="text-center text-gray-700 h-full flex flex-col justify-center items-center hover:bg-gray-600 group transition-all ease-in"
          >
            <RiCommunityLine
              size={100}
              className="group-hover:text-white mb-5"
            />
            <p className="text-3xl  font-semibold group-hover:text-white">
              Construction Project
            </p>
          </Card>
        </Link>
      </Card>
    </div>
  );
}
