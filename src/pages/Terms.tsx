
import React from 'react';
import { Separator } from "@/components/ui/separator";
import Layout from '@/components/Layout';

const Terms = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: May 15, 2025</p>
        
        <Separator className="my-6" />
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing or using ChatterDoc, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="mb-4">
              ChatterDoc provides a platform for collecting, analyzing, and managing customer feedback data. We reserve the right to modify, suspend, or discontinue any aspect of our services at any time.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="mb-4">
              To access certain features of ChatterDoc, you must register for an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
            </p>
            <p>
              You agree to provide accurate information during registration and to update your information promptly if there are any changes.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Subscription and Payment</h2>
            <p className="mb-4">
              Access to certain features of ChatterDoc requires payment of subscription fees. By purchasing a subscription, you agree to pay all applicable fees as specified during the checkout process.
            </p>
            <p>
              Subscriptions automatically renew unless cancelled in advance. You may cancel your subscription at any time, but no refunds will be provided for partial subscription periods.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
            <p>
              All content, features, and functionality of ChatterDoc, including but not limited to text, graphics, logos, and software, are owned by ChatterDoc and are protected by copyright, trademark, and other intellectual property laws.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p>
              In no event shall ChatterDoc be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Contact</h2>
            <p>
              If you have questions about these Terms of Service, please contact us at <a href="mailto:legal@chatterdoc.com" className="text-primary hover:underline">legal@chatterdoc.com</a>.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;
