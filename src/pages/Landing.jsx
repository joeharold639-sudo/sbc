import Hero from '../components/sections/Hero'
import Stats from '../components/sections/Stats'
import SpendFeatures from '../components/sections/SpendFeatures'
import GrowthChart from '../components/sections/GrowthChart'
import Transfers from '../components/sections/Transfers'
import Bitcoin from '../components/sections/Bitcoin'
import Markets from '../components/sections/Markets'
import Security from '../components/sections/Security'
import CTA from '../components/sections/CTA'

export default function Landing() {
  return (
    <main>
      <Hero />
      <Stats />
      <SpendFeatures />
      <GrowthChart />
      <Transfers />
      <Bitcoin />
      <Markets />
      <Security />
      <CTA />
    </main>
  )
}
