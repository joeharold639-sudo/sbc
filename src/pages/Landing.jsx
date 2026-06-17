import Hero from '../components/sections/Hero'
import Stats from '../components/sections/Stats'
import SpendFeatures from '../components/sections/SpendFeatures'
import Transfers from '../components/sections/Transfers'
import Bitcoin from '../components/sections/Bitcoin'
import Security from '../components/sections/Security'
import CTA from '../components/sections/CTA'

export default function Landing() {
  return (
    <main>
      <Hero />
      <Stats />
      <SpendFeatures />
      <Transfers />
      <Bitcoin />
      <Security />
      <CTA />
    </main>
  )
}
