import Link from 'next/link';

export default function PrivacyPolicy() {
  // Last updated date
  const lastUpdated = "May 15, 2023";
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 text-center">Privacy Policy</h1>
          <p className="mt-4 text-lg text-gray-600 text-center max-w-3xl mx-auto">
            Last updated: {lastUpdated}
          </p>
        </div>
      </div>
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="prose max-w-none">
              <h2>1. Introduction</h2>
              <p>
                At Tailors Platform, we respect your privacy and are committed to protecting your personal data. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our website, services, and 
                applications (collectively, the "Services").
              </p>
              <p>
                Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not 
                access our Services.
              </p>
              
              <h2>2. Information We Collect</h2>
              <p>
                We collect information that you provide directly to us, information we collect automatically when you use our Services, 
                and information from third-party sources.
              </p>
              <h3>2.1 Information You Provide</h3>
              <p>
                We collect information you provide when you:
              </p>
              <ul>
                <li>Create an account (name, email, password, phone number)</li>
                <li>Complete your profile (address, profile picture, measurements if you're a buyer, business details if you're a seller)</li>
                <li>Place or fulfill orders</li>
                <li>Contact our customer support</li>
                <li>Participate in surveys or promotions</li>
                <li>Post reviews or comments</li>
                <li>Make payments</li>
              </ul>
              <h3>2.2 Information Collected Automatically</h3>
              <p>
                When you use our Services, we automatically collect certain information, including:
              </p>
              <ul>
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, time spent, actions taken)</li>
                <li>Location information (with your consent)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
              <h3>2.3 Information from Third Parties</h3>
              <p>
                We may receive information about you from third-party partners, such as:
              </p>
              <ul>
                <li>Social media platforms (if you connect your account)</li>
                <li>Payment processors</li>
                <li>Analytics providers</li>
                <li>Advertising partners</li>
              </ul>
              
              <h2>3. How We Use Your Information</h2>
              <p>
                We use your information for various purposes, including:
              </p>
              <ul>
                <li>Providing, maintaining, and improving our Services</li>
                <li>Processing transactions and managing orders</li>
                <li>Creating and managing your account</li>
                <li>Communicating with you about orders, promotions, and updates</li>
                <li>Personalizing your experience</li>
                <li>Protecting against fraud and unauthorized access</li>
                <li>Analyzing how our Services are used</li>
                <li>Complying with legal obligations</li>
              </ul>
              
              <h2>4. How We Share Your Information</h2>
              <p>
                We may share your information in the following circumstances:
              </p>
              <h3>4.1 With Other Users</h3>
              <p>
                If you're a buyer, we share your information with sellers to fulfill your orders. If you're a seller, we share your 
                information with buyers who place orders with you. The shared information may include name, contact details, delivery 
                address, and order specifications.
              </p>
              <h3>4.2 With Service Providers</h3>
              <p>
                We share information with third-party service providers who perform services on our behalf, such as payment processing, 
                data analysis, email delivery, hosting, and customer service.
              </p>
              <h3>4.3 For Legal Reasons</h3>
              <p>
                We may disclose your information if we believe it's necessary to:
              </p>
              <ul>
                <li>Comply with applicable laws and regulations</li>
                <li>Respond to legal process (like a court order or subpoena)</li>
                <li>Protect our rights, privacy, safety, or property</li>
                <li>Investigate potential violations of our Terms of Service</li>
              </ul>
              <h3>4.4 Business Transfers</h3>
              <p>
                If we're involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
              </p>
              <h3>4.5 With Your Consent</h3>
              <p>
                We may share your information in other circumstances with your consent.
              </p>
              
              <h2>5. Your Choices and Rights</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul>
                <li>Accessing, updating, or deleting your information</li>
                <li>Objecting to our processing of your information</li>
                <li>Requesting a copy of your information</li>
                <li>Withdrawing consent (where applicable)</li>
                <li>Opting out of marketing communications</li>
                <li>Managing cookie preferences</li>
              </ul>
              <p>
                To exercise these rights, please contact us at <a href="mailto:privacy@tailorsplatform.com">privacy@tailorsplatform.com</a>.
              </p>
              
              <h2>6. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your information against unauthorized access, 
                alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 
                100% secure, so we cannot guarantee absolute security.
              </p>
              
              <h2>7. Data Retention</h2>
              <p>
                We retain your information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a 
                longer retention period is required or permitted by law. When determining how long to retain information, we consider 
                the amount, nature, sensitivity, potential risk of harm from unauthorized use or disclosure, the purposes for which we 
                process the information, and applicable legal requirements.
              </p>
              
              <h2>8. International Data Transfers</h2>
              <p>
                Your information may be transferred to, and processed in, countries other than the country in which you reside. These 
                countries may have data protection laws that differ from those in your country. By using our Services, you consent to 
                the transfer of your information to these countries. We take steps to ensure that your information receives an adequate 
                level of protection in the countries in which we process it.
              </p>
              
              <h2>9. Children's Privacy</h2>
              <p>
                Our Services are not directed to children under the age of 18. We do not knowingly collect personal information from 
                children under 18. If you believe we have collected information from a child under 18, please contact us immediately.
              </p>
              
              <h2>10. Third-Party Links and Services</h2>
              <p>
                Our Services may contain links to third-party websites and services. We are not responsible for the privacy practices 
                of these third parties. We encourage you to review the privacy policies of any third-party websites or services you visit.
              </p>
              
              <h2>11. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to collect information about your browsing activities and to improve 
                your experience on our Services. You can manage your cookie preferences through your browser settings.
              </p>
              
              <h2>12. Changes to this Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will 
                post the revised Policy on our website and update the "Last updated" date. Your continued use of our Services after any 
                changes to the Privacy Policy constitutes your acceptance of the revised Policy.
              </p>
              
              <h2>13. Contact Us</h2>
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <p>
                Email: <a href="mailto:privacy@tailorsplatform.com">privacy@tailorsplatform.com</a><br />
                Address: 123 Fashion Street, New York, NY 10001
              </p>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                By using our platform, you acknowledge that you have read and understood this Privacy Policy.
              </p>
              
              <div className="mt-6">
                <Link
                  href="/contact"
                  className="inline-flex items-center text-blue-600 hover:text-blue-500"
                >
                  Have questions? Contact us <span aria-hidden="true" className="ml-1">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 