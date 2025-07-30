"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"; // Shadcn Accordion

export default function FAQSection() {
  const faqs = [
    {
      question: "How does GetHired find the most suitable jobs for me?",
      answer:
        "We use advanced AI that analyzes your profile and job details to provide highly personalized, relevant recommendations, going beyond simple keyword matching.",
    },
    {
      question: "Can I really auto-apply to jobs on multiple platforms?",
      answer:
        "Yes! Our system streamlines applications across various job boards and company career sites. This saves you significant time and effort, maximizing your reach.",
    },
    {
      question: "Is GetHired free for job seekers?",
      answer:
        "Yes, GetHired offers a suite of powerful free features designed to accelerate your job search and simplify the application process.",
    },
    {
      question: "How do you ensure my data and privacy are protected?",
      answer:
        "Your privacy is paramount. We implement industry-standard encryption and adhere to strict data protection policies to ensure your personal information remains secure.",
    },
    {
      question: "Do companies post jobs directly on GetHired?",
      answer:
        "Absolutely! We partner with a growing number of companies that post jobs directly on our platform, often providing exclusive opportunities not found elsewhere.",
    },
  ];

  return (
    <section id="faq" className="px-4 py-3 lg:px-20 xl:px-40 2xl:px-80 ">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Find quick answers to the most common questions about GetHired.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
