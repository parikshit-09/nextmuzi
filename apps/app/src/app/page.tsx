import Image from "next/image";
import Appbar from "./components/Appbar";

console.log(process.env.GOOGLE_CLIENT_ID);

export default function Home() {
  return <Appbar />;
}
