"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Zap,
  Link,
  BarChart3,
  Shield,
  Check,
  Star,
  Play,
  ArrowRight,
  Users,
  Clock,
  Smartphone,
} from "lucide-react";
import VideoModalDemo from "@/components/VideoModalComponent";
import TrialButtonWithRouter from "@/components/TrialButtonWithRouter";

type FeatureCardProps = {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const FeatureCard = ({ title, description, icon: Icon }: FeatureCardProps) => (
  <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50 bg-card/50 backdrop-blur-sm">
    <CardHeader className="text-center pb-3">
      <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <CardTitle className="text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      <CardDescription className="text-center text-base leading-relaxed">
        {description}
      </CardDescription>
    </CardContent>
  </Card>
);

type TestimonialCardProps = {
  name: string;
  company: string;
  text: string;
  avatar: React.ReactNode;
  rating?: number;
};

const TestimonialCard = ({
  name,
  company,
  text,
  avatar,
  rating = 5,
}: TestimonialCardProps) => (
  <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-md transition-all duration-300">
    <CardContent className="p-6">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-lg font-bold text-primary-foreground mr-4">
          {avatar}
        </div>
        <div>
          <div className="font-semibold text-foreground">{name}</div>
          <div className="text-sm text-muted-foreground">{company}</div>
        </div>
      </div>
      <div className="flex mb-3">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-muted-foreground italic">"{text}"</p>
    </CardContent>
  </Card>
);

type PricingCardProps = {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText?: string;
};

const PricingCard = ({
  title,
  price,
  period,
  description,
  features,
  isPopular = false,
  buttonText = "Get Started",
}: PricingCardProps) => (
  <Card
    className={`relative ${
      isPopular ? "border-primary shadow-lg scale-105" : "border-border/50"
    } hover:shadow-lg transition-all duration-300`}
  >
    {isPopular && (
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
        <Badge variant="default" className="bg-primary text-primary-foreground">
          Most Popular
        </Badge>
      </div>
    )}
    <CardHeader className="text-center pb-6">
      <CardTitle className="text-2xl">{title}</CardTitle>
      <div className="mt-4">
        <span className="text-4xl font-bold text-foreground">${price}</span>
        <span className="text-muted-foreground">/{period}</span>
      </div>
      <CardDescription className="mt-2">{description}</CardDescription>
    </CardHeader>
    <CardContent className="pt-0">
      <Button
        className={`w-full mb-6 ${
          isPopular ? "bg-primary hover:bg-primary/90" : ""
        }`}
        variant={isPopular ? "default" : "outline"}
      >
        {buttonText}
      </Button>
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

const StatsCard = ({ value, label, icon: Icon }) => (
  <Card className="bg-card/30 backdrop-blur-sm border-border/50">
    <CardContent className="p-6 text-center">
      <Icon className="h-8 w-8 text-primary mx-auto mb-2" />
      <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </CardContent>
  </Card>
);

export default function Home() {
  const features = [
    {
      title: "No-Code Automation",
      description:
        "Build powerful workflows with an intuitive drag-and-drop interface. No coding skills required.",
      icon: Zap,
    },
    {
      title: "Connect Your Apps",
      description:
        "Integrate with 1000+ popular apps and services in minutes. Endless automation possibilities.",
      icon: Link,
    },
    {
      title: "Real-time Monitoring",
      description:
        "Track your automations live with detailed analytics and instant notifications.",
      icon: BarChart3,
    },
    {
      title: "Enterprise Security",
      description:
        "Bank-grade security with SOC 2 compliance and 99.9% uptime guarantee.",
      icon: Shield,
    },
  ];

  const testimonials = [
    {
      name: "Alex Johnson",
      company: "TechCorp",
      text: "Plug N Play transformed our business processes. The automation is seamless and saves us 20+ hours weekly.",
      avatar: "A",
      rating: 5,
    },
    {
      name: "Priya Patel",
      company: "Globex Solutions",
      text: "We connected all our tools in minutes. The support team is fantastic and the platform is incredibly reliable.",
      avatar: "P",
      rating: 5,
    },
    {
      name: "Liam Chen",
      company: "Initech",
      text: "The intuitive interface makes automation accessible to our entire team. Game-changer for productivity.",
      avatar: "L",
      rating: 5,
    },
  ];

  const pricingPlans = [
    {
      title: "Starter",
      price: "0",
      period: "month",
      description: "Perfect for individuals and small teams getting started",
      features: [
        "5 active automations",
        "1,000 tasks per month",
        "Basic app integrations",
        "Email support",
        "Community access",
      ],
      buttonText: "Start Free",
    },
    {
      title: "Professional",
      price: "29",
      period: "month",
      description: "Ideal for growing businesses and power users",
      features: [
        "Unlimited automations",
        "10,000 tasks per month",
        "Premium app integrations",
        "Priority support",
        "Advanced analytics",
        "Custom webhooks",
        "Team collaboration",
      ],
      isPopular: true,
      buttonText: "Start Free Trial",
    },
    {
      title: "Enterprise",
      price: "99",
      period: "month",
      description: "For large organizations with advanced needs",
      features: [
        "Unlimited everything",
        "100,000+ tasks per month",
        "Enterprise integrations",
        "24/7 dedicated support",
        "Advanced security features",
        "Custom integrations",
        "SSO & SCIM",
        "SLA guarantee",
      ],
      buttonText: "Contact Sales",
    },
  ];

  const stats = [
    { value: "50K+", label: "Active Users", icon: Users },
    { value: "2M+", label: "Automations Run", icon: Zap },
    { value: "99.9%", label: "Uptime", icon: Clock },
    { value: "1000+", label: "Integrations", icon: Smartphone },
  ];

  const companies = [
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
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              🚀 New: Advanced AI-powered automations
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Automate Everything,
              <br />
              Code Nothing
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Connect your favorite apps and services with Plug N Play — the
              most intuitive no-code automation platform trusted by 50,000+
              users worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <TrialButtonWithRouter />
              <VideoModalDemo />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Trusted by Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-8 text-muted-foreground">
            Trusted by leading companies worldwide
          </h2>
          <div className="overflow-hidden">
            <div className="flex animate-marquee space-x-8 text-lg">
              {[...companies, ...companies].map((name, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="px-6 py-2 text-base whitespace-nowrap"
                >
                  {name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your automation needs. Start free and
              scale as you grow.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <PricingCard key={index} {...plan} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Loved by Teams Worldwide
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our customers have to say about their automation journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Video Tutorial */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">See It in Action</h2>
          <p className="text-xl text-muted-foreground mb-12">
            Watch how easy it is to create your first automation in under 2
            minutes
          </p>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/ln-hAVCy0tU"
                  title="Tutorial Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Automate Your Workflow?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of teams already saving time with Plug N Play
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Book a Demo
            </Button>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
