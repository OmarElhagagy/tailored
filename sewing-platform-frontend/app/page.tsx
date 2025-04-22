import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Find the Perfect Tailor for Your Unique Style
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Connect with skilled tailors who can bring your clothing ideas to life. 
              Custom-made garments, repairs, and alterations - all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/listings"
                className="inline-block text-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 shadow-md"
              >
                Find Tailors
              </Link>
              <Link
                href="/register"
                className="inline-block text-center px-6 py-3 bg-white hover:bg-gray-100 text-blue-600 font-medium rounded-lg border border-blue-300 transition duration-200"
              >
                Join as a Tailor
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="rounded-lg overflow-hidden shadow-xl">
              <Image
                src="/images/hero-tailor.jpg"
                alt="Tailor working on custom garment"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-4 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                1. Search for Tailors
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Browse our listings to find tailors with the skills you need. Filter by location, services, and reviews.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-4 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                2. Contact & Discuss
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Message tailors directly to discuss your project, pricing, and timeline. Share ideas and measurements.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-4 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                3. Place Order & Enjoy
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Make secure payments through our platform and track your order until it's complete. Then enjoy your custom garment!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tailors/Listings */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Featured Tailors
            </h2>
            <Link href="/listings" className="text-blue-600 hover:underline dark:text-blue-400">
              View All →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Placeholder for featured listings - these would be populated from API */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={`/images/tailor-${item}.jpg`}
                    alt={`Featured tailor ${item}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    Professional Tailor Studio
                  </h3>
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-gray-600 dark:text-gray-300">(24 reviews)</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Specializing in custom suits, alterations, and formal wear. Over 15 years of experience.
                  </p>
                  <Link
                    href={`/listings/${item}`}
                    className="block text-center w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            What Our Customers Say
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                image: "/images/testimonial-1.jpg",
                text: "I found an amazing tailor who made my wedding dress exactly how I imagined it. The process was so smooth and the communication was excellent!"
              },
              {
                name: "David Chen",
                image: "/images/testimonial-2.jpg",
                text: "As someone who's hard to fit, finding a tailor who understands my needs was life-changing. Great service and the quality exceeded my expectations."
              },
              {
                name: "Maria Rodriguez",
                image: "/images/testimonial-3.jpg",
                text: "I've been able to grow my tailoring business thanks to this platform. The tools make it easy to manage clients and showcase my work!"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h3>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  "{testimonial.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 dark:bg-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Your Perfect Fit?
          </h2>
          <p className="text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of customers who have found tailors for their perfect custom clothing. 
            Sign up today and get connected with skilled professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-block px-6 py-3 bg-white hover:bg-gray-100 text-blue-600 font-medium rounded-lg transition duration-200 shadow-md"
            >
              Sign Up Free
            </Link>
            <Link
              href="/listings"
              className="inline-block px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg border border-blue-500 transition duration-200"
            >
              Browse Tailors
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
