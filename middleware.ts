import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware() {
    // Add your middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = { matcher: ["/dashboard/:path*", "/protected/:path*"] }

