import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center mb-2">
            Privacy Policy
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            Last updated: July 30, 2025
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-lg leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
            <p>
              Welcome to GetHired&apos;s Privacy Policy. We are committed to
              protecting your personal data and your right to privacy. If you
              have any questions or concerns about our policy, or our practices
              with regards to your personal information, please contact us at
              varun@devhub.co.in
            </p>
            <p>
              This Privacy Policy applies to all information collected through
              our website, application, and/or any related services, sales,
              marketing or events (we refer to them collectively in this privacy
              policy as the &quot;Services&quot;).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              2. What Information Do We Collect?
            </h2>
            <h3 className="text-xl font-medium mb-2">
              Personal Information You Disclose to Us
            </h3>
            <p>
              We collect personal information that you voluntarily provide to us
              when you register on the Services, express an interest in
              obtaining information about us or our products and Services, when
              you participate in activities on the Services or otherwise when
              you contact us.
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
              <li>Names</li>
              <li>Email addresses</li>
              <li>Phone numbers</li>
              <li>Usernames</li>
              <li>Passwords</li>
              <li>Billing addresses</li>
              <li>Payment information</li>
            </ul>
            <p className="mt-2">
              The personal information that we collect depends on the context of
              your interactions with us and the Services, the choices you make
              and the products and features you use.
            </p>

            <h3 className="text-xl font-medium mb-2 mt-4">
              Information Automatically Collected
            </h3>
            <p>
              We automatically collect certain information when you visit, use
              or navigate the Services. This information does not reveal your
              specific identity (like your name or contact information) but may
              include device and usage information, such as your IP address,
              browser and device characteristics, operating system, language
              preferences, referring URLs, device name, country, location,
              information about how and when you use our Services and other
              technical information.
            </p>
            <p>
              Like many businesses, we also collect information through cookies
              and similar technologies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">
              3. How Do We Use Your Information?
            </h2>
            <p>
              We use personal information collected via our Services for a
              variety of business purposes described below. We process your
              personal information for these purposes in reliance on our
              legitimate business interests, in order to enter into or perform a
              contract with you, with your consent, and/or for compliance with
              our legal obligations. We indicate the specific processing grounds
              we rely on next to each purpose listed below.
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
              <li>To facilitate account creation and logon process.</li>
              <li>To send you marketing and promotional communications.</li>
              <li>To send administrative information to you.</li>
              <li>To fulfill and manage your orders.</li>
              <li>To post testimonials.</li>
              <li>To deliver targeted advertising to you.</li>
              <li>To protect our Services.</li>
              <li>To respond to user inquiries/offer support to users.</li>
              <li>To enable user-to-user communications.</li>
              <li>To request feedback.</li>
              <li>To improve our Services.</li>
            </ul>
          </section>

          {/* Add more sections as needed, e.g.,
          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Will Your Information Be Shared With Anyone?</h2>
            <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Do We Use Cookies and Other Tracking Technologies?</h2>
            <p>We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Policy.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">6. How Long Do We Keep Your Information?</h2>
            <p>We keep your information for as long as necessary to fulfill the purposes outlined in this privacy policy unless otherwise required by law (e.g., tax, accounting or other legal requirements).</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">7. How Do We Keep Your Information Safe?</h2>
            <p>We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the services within a secure environment.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Do We Collect Information From Minors?</h2>
            <p>We do not knowingly solicit data from or market to children under 18 years of age. By using the Services, you represent that you are at least 18 or that you are the parent or guardian of such a minor and consent to such minor dependent's use of the Services. If we learn that personal information from users less than 18 years of age has been collected, we will deactivate the account and take reasonable measures to promptly delete such data from our records.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">9. What Are Your Privacy Rights?</h2>
            <p>In some regions (like the European Economic Area, UK, and California), you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">10. Do We Make Updates To This Policy?</h2>
            <p>Yes, we will update this policy as necessary to stay compliant with relevant laws. The updated version will be indicated by an updated "Revised" date and the updated version will be effective as soon as it is accessible. If we make material changes to this privacy policy, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this privacy policy frequently to be informed of how we are protecting your information.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">11. How Can You Contact Us About This Policy?</h2>
            <p>If you have questions or comments about this policy, you may email us at [Your Contact Email/Method].</p>
          </section>
          */}
        </CardContent>
      </Card>
    </div>
  );
}
