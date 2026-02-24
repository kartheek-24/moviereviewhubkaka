import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full cinema-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full safe-area-inset-top">
        <div className="glass-card border-b border-border/50">
          <div className="container flex items-center h-14 px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
              className="text-foreground hover:bg-muted mr-3"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="font-semibold text-foreground">Privacy Policy</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 pb-20 max-w-3xl mx-auto">
        <div className="glass-card rounded-xl p-6 space-y-6">
          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground">Last updated: January 17, 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to MovieReviewHub By Kaka ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our movie review application.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. Information We Collect</h2>
            <div className="space-y-2 text-muted-foreground leading-relaxed">
              <p><strong className="text-foreground">Account Information:</strong> When you create an account, we collect your email address and display name.</p>
              <p><strong className="text-foreground">User Content:</strong> We store comments, reviews, and reactions you submit to the platform.</p>
              <p><strong className="text-foreground">Device Information:</strong> We may collect device identifiers to provide features like anonymous commenting and push notifications.</p>
              <p><strong className="text-foreground">Usage Data:</strong> We collect information about how you interact with our app, including pages visited and features used.</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 leading-relaxed">
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To allow you to participate in interactive features</li>
              <li>To provide customer support</li>
              <li>To detect, prevent, and address technical issues</li>
              <li>To send push notifications (with your consent)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. Data Storage and Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data is stored securely using industry-standard encryption and security measures. We use Supabase for our backend infrastructure, which provides robust security features including row-level security policies to protect your data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 leading-relaxed">
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">6. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 leading-relaxed">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of push notifications</li>
              <li>Delete your account at any time</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">7. Cookies and Local Storage</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use local storage to save your preferences, such as your display name for comments and authentication tokens. You can clear this data at any time through the Settings page.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">8. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">9. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">10. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this privacy policy, please contact us through the app.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-8">
          <p>MovieReviewHub By Kaka</p>
        </div>
      </main>
    </div>
  );
}
