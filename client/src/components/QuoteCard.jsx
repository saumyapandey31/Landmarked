const QUOTE = {
  text: 'The world is a book, and those who do not travel read only one page.',
  author: 'Saint Augustine',
};

export default function QuoteCard() {
  return (
    <div
      className="rounded-xl2 p-6 flex items-center bg-cover bg-center bg-bg-secondary relative overflow-hidden h-full min-h-[140px]"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=60&w=800')" }}
    >
      <div className="absolute inset-0 bg-deep-gradient opacity-85" />
      <p className="relative text-white font-display text-lg leading-snug">
        “{QUOTE.text}”
        <span className="block text-xs text-white/60 mt-3 font-body not-italic">— {QUOTE.author}</span>
      </p>
    </div>
  );
}
