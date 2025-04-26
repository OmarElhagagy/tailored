import Link from 'next/link';
import Image from 'next/image';

export default function AboutUs() {
  // Team members data
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      image: "/images/team/sarah.jpg",
      bio: "With over 15 years in the fashion industry, Sarah founded Tailors Platform to bridge the gap between skilled tailors and customers seeking quality craftsmanship."
    },
    {
      name: "David Chen",
      role: "CTO",
      image: "/images/team/david.jpg",
      bio: "David brings 10+ years of tech expertise, ensuring our platform delivers a seamless experience for both tailors and customers."
    },
    {
      name: "Maria Rodriguez",
      role: "Head of Tailor Relations",
      image: "/images/team/maria.jpg",
      bio: "A former master tailor herself, Maria ensures we maintain the highest standards for our tailor network."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <h1 className="text-4xl font-bold text-center text-gray-900 sm:text-5xl">
            About Tailors Platform
          </h1>
          <p className="mt-6 text-xl text-center text-gray-600 max-w-3xl mx-auto">
            Connecting skilled tailors with customers worldwide, revolutionizing the way custom clothing is created and delivered.
          </p>
        </div>
      </div>

      {/* Our story section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Our Story
              </h2>
              <div className="mt-6 text-gray-600 space-y-6">
                <p>
                  Founded in 2020, Tailors Platform emerged from a simple observation: while the world had moved online, the tailoring industry remained largely offline and inaccessible.
                </p>
                <p>
                  Our founder, Sarah Johnson, experienced firsthand the challenge of finding quality tailors when she moved to a new city. Simultaneously, many skilled tailors were struggling to reach new customers and expand their businesses.
                </p>
                <p>
                  We built Tailors Platform to bridge this gap - creating a marketplace where talented tailors can showcase their work and connect with customers seeking quality craftsmanship for custom clothing.
                </p>
                <p>
                  Today, we're proud to host thousands of skilled tailors from around the world, each bringing their unique expertise and style to our growing community.
                </p>
              </div>
            </div>
            <div className="mt-12 lg:mt-0 relative h-[400px]">
              <div className="relative h-full rounded-lg shadow-xl overflow-hidden">
                <div className="absolute inset-0 bg-gray-300">
                  {/* Placeholder for image - in production replace with actual image */}
                  <div className="h-full w-full bg-gradient-to-br from-blue-400 to-indigo-500" />
                  {/* <Image 
                    src="/images/about/our-story.jpg" 
                    alt="Tailors at work" 
                    layout="fill" 
                    objectFit="cover" 
                  /> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission and values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Our Mission & Values
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to preserving the art of tailoring while making it accessible to everyone.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Value 1 */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-blue-600 h-12 w-12 flex items-center justify-center rounded-md bg-blue-50">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900">Quality Craftsmanship</h3>
              <p className="mt-4 text-gray-600">
                We believe in the value of handcrafted clothing made with precision and care. Our platform showcases artisans who take pride in their craft.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-blue-600 h-12 w-12 flex items-center justify-center rounded-md bg-blue-50">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900">Empowering Artisans</h3>
              <p className="mt-4 text-gray-600">
                We empower tailors to grow their businesses, reach new customers, and earn fair compensation for their skills and time.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-blue-600 h-12 w-12 flex items-center justify-center rounded-md bg-blue-50">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900">Global Access</h3>
              <p className="mt-4 text-gray-600">
                We're breaking down geographical barriers, giving customers access to skilled tailors from around the world, and tailors access to a global market.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Meet Our Team
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate individuals behind Tailors Platform.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-64 w-full relative bg-gray-300">
                  {/* Placeholder for image - in production replace with actual image */}
                  <div className="h-full w-full bg-gradient-to-br from-gray-400 to-gray-600" />
                  {/* <Image 
                    src={member.image} 
                    alt={member.name} 
                    layout="fill" 
                    objectFit="cover" 
                  /> */}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                  <p className="text-blue-600">{member.role}</p>
                  <p className="mt-4 text-gray-600">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Tailors Platform Impact
            </h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Stat 1 */}
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-4xl font-extrabold text-blue-600">5,000+</p>
              <p className="mt-2 text-gray-600">Skilled Tailors</p>
            </div>

            {/* Stat 2 */}
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-4xl font-extrabold text-blue-600">35</p>
              <p className="mt-2 text-gray-600">Countries</p>
            </div>

            {/* Stat 3 */}
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-4xl font-extrabold text-blue-600">50,000+</p>
              <p className="mt-2 text-gray-600">Happy Customers</p>
            </div>

            {/* Stat 4 */}
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-4xl font-extrabold text-blue-600">100,000+</p>
              <p className="mt-2 text-gray-600">Orders Completed</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Join Our Community
          </h2>
          <p className="mt-4 text-xl text-blue-100 max-w-3xl mx-auto">
            Whether you're a skilled tailor looking to grow your business or a customer seeking quality custom clothing, we'd love to welcome you to our platform.
          </p>
          <div className="mt-8 flex justify-center gap-4 flex-col sm:flex-row">
            <Link href="/register" className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-md font-medium">
              Sign Up Now
            </Link>
            <Link href="/contact" className="bg-blue-500 text-white hover:bg-blue-400 px-6 py-3 rounded-md font-medium">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 