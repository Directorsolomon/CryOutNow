import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 animate-in">
              Share Your Prayer Requests
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-in">
              Join our community of believers supporting each other through prayer. Share your burdens,
              find comfort, and experience the power of united prayer.
            </p>
            <div className="space-x-4 animate-in">
              <Button size="lg" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-serif font-bold text-center mb-16">
              Why Choose CryOutNow?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 bg-background rounded-2xl shadow-sm card-hover animate-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <h3 className="text-xl font-serif font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-serif font-bold mb-6">
              Ready to Join Our Prayer Community?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start sharing your prayer requests and supporting others in their spiritual journey.
            </p>
            <Button size="lg" asChild>
              <Link to="/signup">Create Your Account</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const features = [
  {
    title: "Share Prayer Requests",
    description:
      "Create and share your prayer requests with our supportive community. Choose to share publicly or anonymously.",
  },
  {
    title: "Prayer Support",
    description:
      "Connect with others who understand your journey. Receive encouragement and support through prayer.",
  },
  {
    title: "Track Prayer Progress",
    description:
      "Keep track of answered prayers and updates. Celebrate God's faithfulness together.",
  },
];

export default Index;