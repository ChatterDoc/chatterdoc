
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Form validation schema
const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" })
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const { toast } = useToast();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  });
  
  function onSubmit(data: ContactFormValues) {
    console.log('Form submitted:', data);
    
    // In a real application, this would send the form data to a server
    // For now, we'll just show a success toast
    toast({
      title: "Message sent!",
      description: "Thank you for contacting us. We'll get back to you soon.",
    });
    
    form.reset();
  }
  
  return (
    <div className="container mx-auto py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Contact Us</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Mail size={20} />
                <span>Support</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a href="mailto:support@chatterdoc.io" className="text-primary hover:underline">
                support@chatterdoc.io
              </a>
              <p className="text-sm text-muted-foreground mt-2">
                For help with using our services
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Mail size={20} />
                <span>General</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a href="mailto:info@chatterdoc.io" className="text-primary hover:underline">
                info@chatterdoc.io
              </a>
              <p className="text-sm text-muted-foreground mt-2">
                For general inquiries and information
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Mail size={20} />
                <span>Business</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a href="mailto:info@chatterdoc.io" className="text-primary hover:underline">
                info@chatterdoc.io
              </a>
              <p className="text-sm text-muted-foreground mt-2">
                For partnership and business opportunities
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
            <CardDescription>
              Fill out this form and we'll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="What is this regarding?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please tell us how we can help you..." 
                          className="min-h-32" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full md:w-auto">
                  <Send className="mr-2 h-4 w-4" /> Send Message
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
