export default function Marquee() {
  const items = ['Beyond The Usual', 'Pop Culture', 'Statement Fits', 'Anime Socks', 'Street Style', 'Free Your Fit', 'Zanka']

  return (
    <div className="relative overflow-hidden py-5 mx-5 md:mx-10 border-y" style={{ borderColor: 'rgba(229,33,43,0.2)' }}>
      <div className="flex gap-10 animate-marquee whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-10 shrink-0">
            <span className="font-display text-xl text-white/80 tracking-widest uppercase">{item}</span>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--red)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
