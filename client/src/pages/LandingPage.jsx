import React from "react";
import { Link } from "react-router-dom";
import GridDistortion from "../components/GridDistortion";
import bgImage from "../assets/LandingPage.jpg"; // background image used by the distortion

const LandingPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-slate-900">
      {/* Background effect fills the screen and sits under everything */}
      <GridDistortion
        imageSrc={bgImage} // your jpg from /src/assets
        grid={12}
        mouse={0.15}
        strength={0.2}
        relaxation={0.9}
        className="absolute inset-0 z-0 pointer-events-none" // full-screen, behind content
      />

      {/* Main layout container: centers content and keeps it readable on large screens */}
      <div
        className="
          relative z-10
          mx-auto w-full max-w-[1680px]
          px-4 sm:px-6 lg:px-10 2xl:px-14         /* responsive side padding */
          min-h-screen                 /* fill viewport height */
          flex flex-col                /* column layout: header on top, hero below */
        "
      >
        {/* Top header bar with brand + auth links */}
        <header className="flex items-center justify-between py-4 sm:py-6 xl:py-8">
          <span className="text-xl sm:text-2xl font-bold tracking-tight">
            Landit
          </span>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-medium hover:underline"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="
                text-xs sm:text-sm font-medium
                border border-slate-300/70
                px-3 sm:px-4 py-1.5
                rounded-lg
                bg-white/60 backdrop-blur
                hover:bg-white
              "
            >
              Get started
            </Link>
          </div>
        </header>

        {/* Hero section: takes remaining height and centers vertically */}
        <main
          className="
            flex-1
            flex flex-col md:flex-row
            items-center justify-center      /* vertical + horizontal centering */
            gap-10 md:gap-16 xl:gap-24 2xl:gap-32
            pb-10 xl:pb-14
            w-full max-w-[1500px] mx-auto               /* limit width and center */
          "
        >
          {/* Left side: text content */}
          <section
            className="
              w-full md:w-[52%] xl:w-[56%]              /* full width on mobile, wider on desktop */
              space-y-5
              text-center md:text-left     /* center on small screens, left on bigger */
            "
          >
            <h1
              className="
                text-3xl sm:text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl
                font-bold
                leading-tight
              "
            >
              Track your job search
              <span className="block text-sky-500">
                without getting overwhelmed.
              </span>
            </h1>

            <p
              className="
                text-sm sm:text-base xl:text-lg
                text-slate-700
                max-w-2xl
                mx-auto md:mx-0          /* center paragraph on mobile only */
              "
            >
              Landit keeps all your applications, interviews, and offers in one
              place. Move cards between stages, add notes, and never forget
              where you are in the process.
            </p>

            {/* CTA buttons: stacked on phone, inline on bigger screens */}
            <div
              className="
                flex flex-col sm:flex-row
                items-stretch sm:items-center
                gap-3 sm:gap-4
                pt-2
                max-w-md xl:max-w-lg
                mx-auto md:mx-0
              "
            >
              <Link
                to="/login"
                className="
                  w-full sm:w-auto                   /* full-width button on phone */
                  bg-sky-500 hover:bg-sky-600
                  text-white text-sm font-semibold
                  px-5 py-2.5 xl:px-6 xl:py-3
                  rounded-lg
                  shadow-lg shadow-sky-500/30
                  text-center
                "
              >
                Go to dashboard
              </Link>
              <Link
                to="/login"
                className="
                  w-full sm:w-auto
                  text-sm text-slate-800
                  hover:underline
                  text-center
                "
              >
                Try it with a free account
              </Link>
            </div>

            <ul
              className="
                mt-4
                list-disc
                space-y-1
                pl-5
                text-xs sm:text-sm
                text-slate-700
                max-w-md
                mx-auto md:mx-0
                text-left
              "
            >
              <li>
                Organize applications by status: Applied, Interview, Offer,
                Rejected
              </li>
              <li>Quick drag-and-drop to update where each job is</li>
              <li>Notes and applied date visible at a glance</li>
            </ul>
          </section>

          {/* Right side: simple preview card stack */}
          <section
            className="
              w-full md:w-1/2
              flex justify-center
              mt-8 md:mt-0
            "
          >
            <div
              className="
                w-full max-w-sm xl:max-w-md
                bg-white/75
                backdrop-blur-xl
                border border-white/40
                rounded-2xl
                p-4 sm:p-5 xl:p-6
                shadow-xl
              "
            >
              <h2 className="text-xs sm:text-sm font-semibold mb-3">
                Your pipeline
              </h2>

              <div className="grid grid-cols-2 gap-3 text-[11px] sm:text-xs">
                <div>
                  <p className="font-semibold mb-1">Applied</p>
                  <div className="space-y-1">
                    <div className="bg-slate-100 rounded-md px-3 py-2">
                      <p className="font-semibold text-xs">
                        Data Operations Analyst
                      </p>
                      <p className="text-[11px] text-slate-500">BlackRock</p>
                    </div>
                    <div className="bg-slate-100 rounded-md px-3 py-2">
                      <p className="font-semibold text-xs">SWE Intern</p>
                      <p className="text-[11px] text-slate-500">Microsoft</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="font-semibold mb-1">Interview</p>
                  <div className="space-y-1">
                    <div className="bg-amber-400/15 rounded-md px-3 py-2 border border-amber-300/40">
                      <p className="font-semibold text-xs">Backend Intern</p>
                      <p className="text-[11px] text-slate-500">Target</p>
                    </div>
                    <div className="bg-emerald-400/15 rounded-md px-3 py-2 border border-emerald-300/40">
                      <p className="font-semibold text-xs">Systems Engineer</p>
                      <p className="text-[11px] text-slate-500">Apple</p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-[11px] text-slate-500">
                Your real dashboard shows logos, notes, and applied dates for
                every job.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default LandingPage;
