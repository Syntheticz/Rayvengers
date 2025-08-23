import { auth } from "@/auth";

import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth } = req;
  const user = auth?.user;
  const pathname = req.nextUrl.pathname;

  function getNewURL(url: string) {
    return new URL(url, nextUrl.origin);
  }

  if (req.auth && pathname === "/" && req.auth.user.role === "Student") {
    return Response.redirect(getNewURL("student/guide"));
  }

  if (
    req.auth &&
    pathname === "/student-auth" &&
    req.auth.user.role === "Student"
  ) {
    return Response.redirect(getNewURL("student/guide"));
  }

  if (req.auth && pathname === "/" && req.auth.user.role === "Teacher") {
    return Response.redirect(getNewURL("teacher/dashboard"));
  }

  // if (!req.auth && req.nextUrl.pathname !== "/login") {
  //   const newUrl = new URL("/login", req.nextUrl.origin);
  //   return Response.redirect(newUrl);
  // }

  // if (auth && nextUrl.pathname === "/login") {
  //   return NextResponse.redirect(getNewURL("/"));
  // }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

// export const config = {
//   matcher: ["/test"],
// };
