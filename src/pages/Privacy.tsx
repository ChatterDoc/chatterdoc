
import React from 'react';
import { Separator } from "@/components/ui/separator";
import Layout from '@/components/Layout';

const Privacy = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: May 15, 2025</p>
        
        <Separator className="my-6" />
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="mb-4">
              At ChatterDoc, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
            </p>
            <p>
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p className="mb-4">
              We collect information that you provide directly to us when you:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Register for an account</li>
              <li>Use our services</li>
              <li>Contact customer support</li>
              <li>Complete forms on our platform</li>
            </ul>
            <p>
              This information may include your name, email address, business information, payment details, and feedback data that you process through our system.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send administrative messages and updates</li>
              <li>Respond to your comments and questions</li>
              <li>Analyze usage patterns and improve our services</li>
              <li>Protect against fraud and unauthorized access</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect the security of your personal information. However, please note that no method of transmission over the Internet or electronic storage is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy, please contact us at <a href="mailto:privacy@chatterdoc.com" className="text-primary hover:underline">privacy@chatterdoc.com</a>.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
