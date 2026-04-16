import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Mariners Market",
  description: "Learn how Mariners Market collects, uses, and protects your personal information.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white min-h-screen pt-40 pb-20 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-8 text-slate-900">
        <div className="space-y-2 border-b border-slate-100 pb-8">
          <h1 className="text-4xl font-black uppercase tracking-tight">Privacy Policy</h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Last updated: April 16th, 2026</p>
        </div>

        <section className="space-y-4">
          <p className="text-sm leading-relaxed">
            This Privacy Policy describes how Mariners Market (the "Site", "we", "us", or "our") collects, uses, and discloses your personal information when you visit, use our services, or make a purchase from <a href="https://www.marinersmarkets.com" className="underline font-bold">www.marinersmarkets.com</a> (the "Site") or otherwise communicate with us (collectively, the "Services").
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight">1. Changes to This Privacy Policy</h2>
          <p className="text-sm leading-relaxed">
            We may update this Privacy Policy from time to time to reflect changes to our practices or for operational, legal, or regulatory reasons. We will post the revised policy on the Site and update the "Last updated" date accordingly.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight">2. How We Collect and Use Your Personal Information</h2>
          <p className="text-sm leading-relaxed">To provide the Services, we collect personal information from several sources:</p>
          <div className="pl-4 space-y-4 border-l-2 border-slate-50">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest mb-1">Information You Provide Directly:</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li><strong>Contact Details:</strong> Name, address, phone number, and email.</li>
                <li><strong>Order Information:</strong> Billing address, shipping address, payment confirmation, and purchase history.</li>
                <li><strong>Account Information:</strong> Username, password, and security credentials.</li>
                <li><strong>Customer Support:</strong> Information included in your communications with us.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest mb-1">Information Collected Automatically (Usage Data):</h3>
              <p className="text-sm">We use cookies and similar tracking technologies to collect data about your interaction with our Services, including device information, browser type, IP address, and how you navigate the Site.</p>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest mb-1">Information from Third Parties:</h3>
              <p className="text-sm">We receive information from service providers who collect data on our behalf, such as payment processors (handling encrypted financial data) and fulfillment partners.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight">3. How We Use Your Personal Information</h2>
          <ul className="list-disc pl-5 text-sm space-y-2">
            <li><strong>Service Delivery:</strong> To process payments, fulfill orders, manage your account, and arrange shipping.</li>
            <li><strong>B2B & Team Management:</strong> To facilitate bulk ordering, manage crew sizing rosters, and maintain organization-specific purchase histories.</li>
            <li><strong>Marketing:</strong> To send promotional communications (where permitted by law) and tailor advertisements to your interests.</li>
            <li><strong>Security & Fraud Prevention:</strong> To detect and investigate malicious or illegal activity.</li>
            <li><strong>Communication:</strong> To provide customer support and notify you of order updates.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight">4. Cookies</h2>
          <p className="text-sm leading-relaxed">
            We use cookies to improve Site functionality, run analytics, and remember your preferences. You can manage cookie settings through your browser; however, disabling cookies may limit your access to certain features of the Services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight">5. Disclosure of Personal Information</h2>
          <p className="text-sm leading-relaxed">We may share your personal information with third parties in the following circumstances:</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li><strong>Service Providers:</strong> Vendors performing IT management, payment processing, data analytics, and shipping.</li>
            <li><strong>Business Partners:</strong> Marketing partners who assist in advertising and service improvement.</li>
            <li><strong>Legal Compliance:</strong> To comply with applicable laws, respond to legal requests, or protect our rights and the safety of our users.</li>
            <li><strong>Corporate Transactions:</strong> In connection with a merger, sale, or business restructuring.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight">6. Security and Retention</h2>
          <p className="text-sm leading-relaxed">
            We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure. We retain your personal information only as long as necessary to maintain your account, provide Services, comply with legal obligations, or resolve disputes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight">7. International Transfers</h2>
          <p className="text-sm leading-relaxed">
            Your information may be transferred to and processed in countries outside of your residence. For users in the EEA or UK, we rely on recognized transfer mechanisms, such as Standard Contractual Clauses, to ensure your data remains protected.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight">8. Your Rights</h2>
          <p className="text-sm leading-relaxed">Depending on your location, you may have the following rights:</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li><strong>Access/Know:</strong> Request a copy of the data we hold about you.</li>
            <li><strong>Correction/Deletion:</strong> Request that we update inaccurate data or erase your information.</li>
            <li><strong>Opt-Out:</strong> Direct us not to "sell" or "share" your information for targeted advertising.</li>
            <li><strong>Portability:</strong> Request that we transfer your data to a third party.</li>
          </ul>
          <p className="text-sm">To exercise these rights, please contact us using the details below.</p>
        </section>

        <section className="space-y-4 pt-8 border-t border-slate-100">
          <h2 className="text-xl font-black uppercase tracking-tight">9. Contact Us</h2>
          <div className="bg-slate-50 p-6 rounded-2xl space-y-2 border border-slate-100">
            <p className="text-sm"><strong>Email:</strong> <a href="mailto:christopherlam@marinersmarkets.com" className="underline">christopherlam@marinersmarkets.com</a></p>
            <p className="text-sm"><strong>Address:</strong> 129 Lung Mei Tsuen Road, Sai Kung, NT, HK</p>
            <p className="text-sm"><strong>Data Controller:</strong> Mariners Market</p>
          </div>
        </section>
      </div>
    </div>
  )
}
