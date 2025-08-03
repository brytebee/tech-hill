// app/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Users, Award, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  let session = null;

  try {
    // Safely attempt to get session
    session = await getServerSession(authOptions);
  } catch (error) {
    // If auth isn't working yet, just continue without session
    console.error("Auth error:", error);
  }

  // If user is logged in, redirect to appropriate dashboard
  if (session?.user?.role) {
    const role = session.user.role.toLowerCase();
    redirect(`/${role}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Tech Hill</h1>
              <span className="ml-2 text-gray-600">
                Computer Literacy Platform
              </span>
            </div>
            <div className="flex space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Master Computer Skills with Confidence
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            From basic computer navigation to advanced digital literacy, our
            interactive platform helps you build essential skills step by step.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register">
              <Button size="lg" className="px-8">
                Start Learning Today
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader className="text-center">
              <BookOpen className="h-10 w-10 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Interactive Lessons</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Learn through hands-on exercises and real-world scenarios
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <TrendingUp className="h-10 w-10 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Monitor your learning journey with detailed analytics
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Award className="h-10 w-10 text-yellow-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Skill Mastery</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Achieve mastery through adaptive learning and assessments
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-10 w-10 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Expert Support</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Get help from instructors and connect with fellow learners
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Learning Paths Preview */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Popular Learning Paths
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Computer Basics</CardTitle>
                <CardDescription>
                  Mouse, keyboard, and navigation fundamentals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Mouse control and clicking</li>
                  <li>• Keyboard typing skills</li>
                  <li>• File and folder management</li>
                  <li>• Desktop navigation</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Internet Essentials</CardTitle>
                <CardDescription>
                  Web browsing and online safety
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Web browser basics</li>
                  <li>• Search techniques</li>
                  <li>• Email fundamentals</li>
                  <li>• Online security</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Digital Productivity</CardTitle>
                <CardDescription>
                  Essential software and applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Word processing</li>
                  <li>• Spreadsheet basics</li>
                  <li>• Presentation tools</li>
                  <li>• Cloud storage</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Tech Hill. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
