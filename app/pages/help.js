import Link from 'next/link';

export default function HelpCenter() {
  // FAQ data
  const faqs = [
    {
      question: 'How do I place an order?',
      answer: 'To place an order, browse our products, select the item you want, specify any customization options if applicable, and click "Add to Cart". When you\'re ready to checkout, click on the cart icon, review your items, and follow the checkout process.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept credit/debit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for certain orders. All payments are securely processed.'
    },
    {
      question: 'How long will it take to receive my order?',
      answer: 'Custom tailored items typically take 2-3 weeks to complete, followed by shipping time which depends on your location. Standard products are usually shipped within 2-5 business days. You can check the estimated delivery time during checkout.'
    },
    {
      question: 'Can I modify or cancel my order?',
      answer: 'You can modify or cancel your order within 24 hours of placing it. For custom tailored items, modifications or cancellations must be made before production begins. Please contact our customer service team as soon as possible.'
    },
    {
      question: 'How do I provide my measurements?',
      answer: 'For custom tailored items, you can provide your measurements by following our detailed measurement guide available on our website. Alternatively, you can visit one of our partner tailors for professional measurements.'
    },
    {
      question: 'What if my order doesn\'t fit correctly?',
      answer: 'We have a satisfaction guarantee policy. If your order doesn\'t fit correctly, we offer alterations or remakes. Please contact our customer service within 14 days of receiving your order.'
    },
    {
      question: 'How do I contact a seller directly?',
      answer: 'You can contact a seller by visiting their profile page and clicking on the "Contact Seller" button. This will allow you to send them a direct message with any questions about their products or services.'
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Yes, we ship to most countries worldwide. Shipping costs and delivery times vary depending on the destination. Import duties and taxes may apply and are the responsibility of the customer.'
    }
  ];
  
  // Support categories
  const supportCategories = [
    {
      title: 'Orders & Delivery',
      icon: (
        <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      description: 'Track your order, shipping information, and delivery status'
    },
    {
      title: 'Returns & Refunds',
      icon: (
        <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
        </svg>
      ),
      description: 'Learn about our return policy and how to request a refund'
    },
    {
      title: 'Measurements & Sizing',
      icon: (
        <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
      description: 'Guides for taking accurate measurements for custom clothing'
    },
    {
      title: 'Account & Payments',
      icon: (
        <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Manage your account settings, payment methods, and security'
    },
    {
      title: 'For Sellers',
      icon: (
        <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      description: 'Resources, guidelines, and support for our seller community'
    },
    {
      title: 'Technical Support',
      icon: (
        <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      description: 'Help with website functions, account access, and technical issues'
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 text-center">Help Center</h1>
          <p className="mt-4 text-lg text-gray-600 text-center max-w-3xl mx-auto">
            Find answers to common questions, get support for your orders, and learn how to make the most of our platform.
          </p>
          
          <div className="mt-8">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 pl-10"
                  placeholder="Search for answers..."
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Support Categories */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Support Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportCategories.map((category, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {category.icon}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{category.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{category.description}</p>
                    <div className="mt-3">
                      <Link href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        Learn more <span aria-hidden="true">&rarr;</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Frequently Asked Questions */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="bg-white shadow rounded-lg overflow-hidden divide-y divide-gray-200">
            {faqs.map((faq, index) => (
              <div key={index} className="p-6">
                <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                <p className="mt-2 text-base text-gray-500">{faq.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-base text-gray-600">
              Can't find what you're looking for? We're here to help.
            </p>
            <Link 
              href="/contact" 
              className="mt-4 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Contact Support
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
} 