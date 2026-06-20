import SmoothScroll from '@/components/SmoothScroll'
import Cursor from '@/components/Cursor'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Marquee from '@/components/Marquee'
import Shop from '@/components/Shop'
import About from '@/components/About'
import Gallery from '@/components/Gallery'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <SmoothScroll>
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Shop />
        <About />
        <Gallery />
      </main>
      <Footer />
    </SmoothScroll>
  )
}
