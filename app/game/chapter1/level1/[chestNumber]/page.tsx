import { useParams } from "next/navigation";
import React from "react";

export default function Page() {
  const param = useParams();
  console.log(param);
  return <div>Page</div>;
}
