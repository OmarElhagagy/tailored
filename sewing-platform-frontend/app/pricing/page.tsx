'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/FormElements';
import Link from 'next/link';

// Pricing plans data
const PRICING_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for individuals looking for tailoring services',
    price: 0,
    features: [
      'Access to tailor listings',
      'Contact with tailors',
      'Basic customer support',
      'Order tracking'
    ],
    cta: 'Get Started',
    isPopular: false
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'For frequent customers who want priority service',
    price: 9.99,
    period: 'month',
    features: [
      'All Basic features',
      'Priority customer support',
      'Exclusive discounts',
      'Early access to new tailors',
      'No booking fees'
    ],
    cta: 'Start Premium',
    isPopular: true
  },
  {
    id: 'business',
    name: 'Business',
    description: 'For professional tailors and businesses',
    price: 29.99,
    period: 'month',
    features: [
      'All Premium features',
      'Featured listings',
      'Business analytics',
      'Unlimited order capacity',
      'Dedicated account manager',
      'Custom branding options'
    ],
    cta: 'Contact Sales',
    isPopular: false
  }
];

// FAQs
const FAQS = [
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay. For Business plans, we also offer invoicing.'
  },
  {
    question: 'Can I cancel my subscription at any time?',
    answer: 'Yes, you can cancel your subscription at any time. Your plan will remain active until the end of your current billing period.'
  },
  {
    question: 'Is there a free trial available?',
    answer: 'We offer a 14-day free trial for our Premium plan so you can experience all the features before committing.'
  },
  {
    question: 'How do I upgrade or downgrade my plan?',
    answer: 'You can change your plan at any time by going to your Account Settings and selecting "Subscription". Changes will take effect at the start of your next billing cycle.'
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 30-day money-back guarantee if you're not satisfied with our service.'
  }
];

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' or 'annually'
  const [selectedFAQ, setSelectedFAQ] = useState(null);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const toggleFAQ = (index) => {
    if (selectedFAQ === index) {
      setSelectedFAQ(null);
    } else {
      setSelectedFAQ(index);
    }
  };

  // Calculate annual price (20% discount)
  const getPrice = (plan) => {
    if (plan.price === 0) return 'Free';
    
    const price = billingPeriod === 'annually' 
      ? plan.price * 12 * 0.8 
      : plan.price;
      
    return `$${price.toFixed(2)}`;
  };

  // Get billing period label
  const getPeriodLabel = (plan) => {
    if (plan.price === 0) return '';
    return billingPeriod === 'annually' ? '/year' : '/month';
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight">
            <span className="block">Simple, Transparent Pricing</span>
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-300">
            Choose the perfect plan for your tailoring needs
          </p>
          
          {/* Billing toggle */}
          <div className="mt-12 flex justify-center">
            <div className="relative bg-white dark:bg-gray-700 p-0.5 rounded-lg flex">
              <button
                type="button"
                className={`relative px-6 py-2 rounded-md text-sm font-medium ${
                  billingPeriod === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white'
                }`}
                onClick={() => setBillingPeriod('monthly')}
              >
                Monthly
              </button>
              <button
                type="button"
                className={`relative px-6 py-2 rounded-md text-sm font-medium ${
                  billingPeriod === 'annually'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white'
                }`}
                onClick={() => setBillingPeriod('annually')}
              >
                Annually <span className="text-xs font-semibold text-green-500 dark:text-green-400">Save 20%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="mt-16 max-w-7xl mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {PRICING_PLANS.map((plan) => (
            <div 
              key={plan.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${
                plan.isPopular ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
              }`}
            >
              {plan.isPopular && (
                <div className="bg-blue-500 text-white text-center text-sm font-semibold py-1">
                  Most Popular
                </div>
              )}
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                <p className="mt-6">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{getPrice(plan)}</span>
                  <span className="text-base font-medium text-gray-500 dark:text-gray-400">{getPeriodLabel(plan)}</span>
                </p>
                
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-500 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">{feature}</p>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8">
                  <Button variant={plan.isPopular ? 'primary' : 'outline'} className="w-full">
                    {plan.cta}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise */}
        <div className="mt-16 max-w-7xl mx-auto bg-blue-600 dark:bg-blue-700 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-12 sm:p-12 sm:flex">
            <div className="sm:w-2/3">
              <h3 className="text-2xl font-semibold text-white">Enterprise Plan</h3>
              <p className="mt-4 text-lg text-blue-100">
                Custom solution for large businesses with specialized needs
              </p>
              <ul className="mt-6 text-blue-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2">Custom integrations</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2">24/7 premium support</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2">Volume discounts</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2">Dedicated success manager</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 sm:mt-0 sm:w-1/3 sm:flex sm:flex-col sm:items-center sm:justify-center">
              <p className="text-lg font-medium text-white">Custom pricing</p>
              <div className="mt-4">
                <Button variant="white" size="lg">
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <dl className="space-y-6 divide-y divide-gray-200 dark:divide-gray-700">
            {FAQS.map((faq, index) => (
              <div key={index} className="pt-6">
                <dt className="text-lg">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="text-left w-full flex justify-between items-start text-gray-900 dark:text-white"
                  >
                    <span className="font-medium">{faq.question}</span>
                    <span className="ml-6 h-7 flex items-center">
                      <svg
                        className={`h-6 w-6 transform ${selectedFAQ === index ? '-rotate-180' : 'rotate-0'}`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>
                </dt>
                <dd className={`mt-2 pr-12 ${selectedFAQ === index ? 'block' : 'hidden'}`}>
                  <p className="text-base text-gray-500 dark:text-gray-400">{faq.answer}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* CTA */}
        <div className="mt-20 max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Ready to get started?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Join thousands of satisfied users already using our platform
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/register">
              <Button variant="primary" size="lg">
                Sign Up Now
              </Button>
            </Link>
            <Link href="/contact" className="ml-4">
              <Button variant="outline" size="lg">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
