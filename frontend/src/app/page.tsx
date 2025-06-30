import Accordion from "@/components/landing/Accordion";
import FeatureCard from "@/components/landing/FeatureCard";
import TestimonialCard from "@/components/landing/TestimonialCard";
import { faqs } from "@/data/faqs";
import Image from "next/image";
import logo from "../logo.svg";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex flex-col items-center text-white w-full">
      <header className="w-full max-w-4xl px-6 py-16 flex flex-col items-center text-center">
        <Image
          src={logo}
          className="h-28 mb-6 drop-shadow-lg animate-[spin_10s_linear_infinite]"
          alt="Plug N Play Logo"
        />

        <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
          Plug N Play
        </h1>
        <p className="text-xl mb-8 max-w-xl text-blue-100">
          Automate your workflows effortlessly. Connect your favorite apps and
          services with Plug N Play — the no-code automation platform for
          everyone.
        </p>
        <a
          href="#get-started"
          className="bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition mb-12 text-lg"
        >
          Get Started
        </a>
        <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-8 mt-8">
          <FeatureCard
            title="No-Code Automation"
            description="Build powerful workflows with a simple drag-and-drop interface. No coding required."
            icon="⚡"
          />
          <FeatureCard
            title="Connect Your Apps"
            description="Integrate with popular apps and services in minutes. Endless possibilities."
            icon="🔗"
          />
          <FeatureCard
            title="Real-time Monitoring"
            description="Track your automations live and get instant notifications when things happen."
            icon="📈"
          />
          <FeatureCard
            title="Secure & Reliable"
            description="Enterprise-grade security and reliability for peace of mind."
            icon="🔒"
          />
        </div>
      </header>

      {/* Trusted by section */}
      <section className="w-full py-10 bg-gradient-to-r from-blue-800/80 to-purple-800/80 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4">
          Trusted by leading companies
        </h2>
        <div className="overflow-hidden w-full max-w-4xl">
          <div className="flex whitespace-nowrap animate-marquee space-x-12 text-lg opacity-80">
            {[
              "Acme Corp",
              "Globex",
              "Initech",
              "Umbrella",
              "Wayne Enterprises",
              "Stark Industries",
              "Wonka",
              "Hooli",
              "Cyberdyne",
              "Soylent",
            ].map((name, i) => (
              <span
                key={i}
                className="px-6 py-2 bg-white/10 rounded-lg border border-white/10 mx-2 min-w-max"
              >
                {name}
              </span>
            ))}
            {/* Repeat for smooth loop */}
            {[
              "Acme Corp",
              "Globex",
              "Initech",
              "Umbrella",
              "Wayne Enterprises",
              "Stark Industries",
              "Wonka",
              "Hooli",
              "Cyberdyne",
              "Soylent",
            ].map((name, i) => (
              <span
                key={i + 100}
                className="px-6 py-2 bg-white/10 rounded-lg border border-white/10 mx-2 min-w-max"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="w-full py-16 flex flex-col items-center bg-gradient-to-r from-purple-900/80 to-blue-900/80">
        <h2 className="text-2xl font-bold mb-8">What our customers say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
          <TestimonialCard
            name="Alex Johnson"
            company="Acme Corp"
            text="Plug N Play transformed our business processes. The automation is seamless and the UI is a joy to use!"
            avatar="A"
          />
          <TestimonialCard
            name="Priya Patel"
            company="Globex"
            text="We connected all our tools in minutes. The support team is fantastic and the platform is rock solid."
            avatar="P"
          />
          <TestimonialCard
            name="Liam Chen"
            company="Initech"
            text="I love how easy it is to build and monitor automations. Plug N Play saves us hours every week."
            avatar="L"
          />
        </div>
      </section>

      {/* FAQ section */}
      <section className="w-full py-16 flex flex-col items-center bg-gradient-to-r from-blue-900/80 to-indigo-900/80">
        <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
        <div className="w-full max-w-2xl">
          <Accordion faqs={faqs} />
        </div>
      </section>

      {/* Tutorial video section */}
      <section className="w-full py-16 flex flex-col items-center bg-gradient-to-r from-indigo-900/80 to-purple-900/80">
        <h2 className="text-2xl font-bold mb-8">Watch a quick tutorial</h2>
        <div className="w-full max-w-2xl aspect-video rounded-xl overflow-hidden shadow-lg border border-white/10">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="Plug N Play Tutorial"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      </section>
    </div>
  );
}
