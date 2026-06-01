import html from '@/components/markup/contact';

export default function Contact() {
  return (
    <section
      id="contact"
      className="fluid-section-py fluid-section-px pb-32 md:pb-52 bg-charcoal text-white rounded-t-[3rem] sm:rounded-t-[5rem] md:rounded-t-[100px] relative overflow-hidden h-auto"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
