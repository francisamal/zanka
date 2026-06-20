import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="py-10 px-5 md:px-10 border-t" style={{ borderColor: 'rgba(229,33,43,0.15)' }}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative" style={{ width: 88, height: 45 }}>
          <Image src="/logo/1000340389.png" alt="ZANKA" fill className="object-contain object-left" />
        </div>

        <div className="flex gap-8">
          {['Socks', 'Tops', 'About', 'Contact'].map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="font-body text-xs tracking-[0.2em] uppercase text-white/20 hover:text-white transition-colors duration-300 font-light"
            >
              {item}
            </a>
          ))}
        </div>

        <p className="font-body text-xs text-white/15 font-light tracking-wider">
          © 2025 ZANKA. Beyond The Usual.
        </p>
      </div>
    </footer>
  )
}
