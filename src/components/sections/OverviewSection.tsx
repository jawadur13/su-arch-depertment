'use client';

import Image from 'next/image';
import {motion} from 'motion/react';
import Container from '../ui/Container';

export default function OverviewSection() {
  return (
    <section className="bg-white py-8 md:py-16">
      <Container className="!max-w-[1120px]">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 md:mb-8 text-center text-2xl font-bold leading-tight text-primary md:text-[25px]"
        >
          Department of Architecture
        </motion.h2>

        <div className="mx-auto max-w-[1090px]">
          <div className="grid items-stretch gap-8 lg:gap-12 lg:grid-cols-[520px_1fr]">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <p className="text-justify text-[16px] font-medium leading-[1.75] tracking-[0.035em] text-black">

The Department of Architecture, under the Faculty of Science & Engineering, offers the Bachelor of Architecture (B.Arch) degree at Sonargaon University (SU). The programme follows the academic and professional standards of the Institute of Architects Bangladesh (IAB), with a continuously updated curriculum designed to meet contemporary needs while allowing flexibility based on students’ interests.

Design studios form the core of the programme, supported by a 1:10 teacher-student ratio, industry-oriented projects, and research-based learning. The department also promotes co-curricular activities, cultural engagement, and strong connections with industry and other stakeholders to prepare students for successful professional careers.
</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2 overflow-hidden rounded-2xl relative h-[280px] lg:h-auto"
            >
              <Image
                src="https://res.cloudinary.com/ynfut7mx/image/upload/f_auto,q_auto:good/v1786781519/sonargaon-arch/gallery/qsmpqfsxqyvuw8jl6xnu.png"
                alt="Department of Architecture students celebrating with trophies at the AYDA Awards ceremony"
                fill
                sizes="(min-width: 1024px) 540px, 100vw"
                className="object-cover"
              />
            </motion.div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:max-w-[520px]">
            <a
              href="/about/overview"
              className="rounded-full bg-gradient-to-r from-primary to-accent px-8 py-3 text-center text-base font-semibold text-white shadow-md transition-all hover:shadow-premium"
            >
              Explore More
            </a>
            <a
              href="/about/deans-message"
              className="rounded-full bg-gradient-to-r from-primary to-accent px-8 py-3 text-center text-base font-semibold text-white shadow-md transition-all hover:shadow-premium"
            >
              Dean's Message
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
