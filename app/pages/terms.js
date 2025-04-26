import Link from 'next/link';

export default function TermsOfService() {
  // Last updated date
  const lastUpdated = "May 15, 2023";
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 text-center">Terms of Service</h1>
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
                Welcome to Tailors Platform. These Terms of Service ("Terms") govern your use of our website, services, 
                and applications (collectively, the "Services") provided by Tailors Platform ("we," "us," or "our").
              </p>
              <p>
                By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, 
                please do not use our Services.
              </p>
              
              <h2>2. Eligibility</h2>
              <p>
                You must be at least 18 years old to use our Services. By using our Services, you represent and warrant that you 
                are at least 18 years old and have the legal capacity to enter into these Terms.
              </p>
              
              <h2>3. User Accounts</h2>
              <p>
                When you create an account with us, you must provide accurate, complete, and current information. You are responsible 
                for safeguarding your account credentials and for any activity that occurs under your account. You must notify us 
                immediately of any unauthorized use of your account.
              </p>
              <p>
                We reserve the right to disable your account if we determine, in our sole discretion, that you have violated these Terms.
              </p>
              
              <h2>4. User Roles</h2>
              <p>
                Our platform supports two types of users:
              </p>
              <ul>
                <li>
                  <strong>Buyers:</strong> Individuals who purchase tailoring services or products through our platform.
                </li>
                <li>
                  <strong>Sellers (Tailors):</strong> Professionals who offer tailoring services or products through our platform.
                </li>
              </ul>
              <p>
                Specific terms may apply to each user role, as outlined in these Terms.
              </p>
              
              <h2>5. Orders and Payments</h2>
              <p>
                <strong>For Buyers:</strong> When you place an order through our platform, you agree to pay the specified price, 
                including any applicable taxes and fees. Payment must be made using one of our approved payment methods.
              </p>
              <p>
                <strong>For Sellers:</strong> When you accept an order through our platform, you agree to provide the specified 
                services or products according to the agreed-upon terms. We will process payments and transfer funds to you according 
                to our payment schedule, less any applicable platform fees.
              </p>
              
              <h2>6. Cancellations and Refunds</h2>
              <p>
                Cancellation and refund policies may vary depending on the seller's policies. Buyers should review these policies 
                before placing an order. In general:
              </p>
              <ul>
                <li>Cancellations may be subject to fees or penalties, depending on the timing and circumstances.</li>
                <li>Refunds may be issued for orders that are not completed or that do not meet the specified requirements.</li>
                <li>Dispute resolution will be handled according to our platform policies.</li>
              </ul>
              
              <h2>7. User Content</h2>
              <p>
                You retain ownership of any content you submit to our platform, including but not limited to photos, reviews, and 
                messages. However, you grant us a non-exclusive, royalty-free, transferable, sublicensable, worldwide license to use, 
                display, reproduce, and distribute your content in connection with our Services.
              </p>
              <p>
                You represent and warrant that your content does not violate any third-party rights and complies with our content policies.
              </p>
              
              <h2>8. Prohibited Conduct</h2>
              <p>
                You agree not to engage in any of the following prohibited activities:
              </p>
              <ul>
                <li>Violating any applicable laws or regulations.</li>
                <li>Infringing on the rights of others, including intellectual property rights.</li>
                <li>Harassing, threatening, or intimidating other users.</li>
                <li>Submitting false or misleading information.</li>
                <li>Attempting to gain unauthorized access to our systems or user accounts.</li>
                <li>Using our Services for any illegal or unauthorized purpose.</li>
                <li>Interfering with the proper functioning of our Services.</li>
              </ul>
              
              <h2>9. Intellectual Property</h2>
              <p>
                Our platform, including its content, features, and functionality, is owned by us or our licensors and is protected 
                by copyright, trademark, and other intellectual property laws. You may not use our intellectual property without our 
                prior written consent.
              </p>
              
              <h2>10. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages, including but not limited to loss of profits, data, use, or goodwill, arising out of or in 
                connection with your use of our Services.
              </p>
              
              <h2>11. Disclaimer of Warranties</h2>
              <p>
                Our Services are provided on an "as is" and "as available" basis, without any warranties of any kind, either express 
                or implied. We disclaim all warranties, including but not limited to implied warranties of merchantability, fitness 
                for a particular purpose, and non-infringement.
              </p>
              
              <h2>12. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless Tailors Platform and its officers, directors, employees, agents, 
                and affiliates from and against any claims, liabilities, damages, losses, and expenses, including but not limited to 
                reasonable attorneys' fees, arising out of or in any way connected with your access to or use of our Services or your 
                violation of these Terms.
              </p>
              
              <h2>13. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], without regard to its 
                conflict of law provisions.
              </p>
              
              <h2>14. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. If we make changes, we will provide notice by posting the 
                updated Terms on our website and updating the "Last updated" date. Your continued use of our Services after any such 
                changes constitutes your acceptance of the new Terms.
              </p>
              
              <h2>15. Termination</h2>
              <p>
                We may terminate or suspend your access to our Services at any time, without prior notice or liability, for any reason, 
                including but not limited to a breach of these Terms.
              </p>
              
              <h2>16. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <p>
                Email: <a href="mailto:legal@tailorsplatform.com">legal@tailorsplatform.com</a><br />
                Address: 123 Fashion Street, New York, NY 10001
              </p>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                By using our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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