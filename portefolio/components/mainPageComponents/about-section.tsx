"use client"

import { User, Code2 } from "lucide-react"

export function AboutSection() {
  return (
    <section className="relative w-full bg-[#E8E2E1] py-12 md:py-16">
      <div className="container mx-auto px-6">
        
        <div className="space-y-16">
          
          {/* Quem sou eu? */}
          <div className="group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                Who am I?
              </h2>
            </div>
            
            <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-200">
              <p className="text-lg md:text-xl text-slate-700 leading-relaxed hyphens-auto text-justify">
                Hi, my name is João, and I am a startup enthusiast, studying Computer Science at FEUP and passionate about gym, tech, and business. Since I was a kid, I always said that my dream was to become an entrepreneur even though I didn't know which area I would want to work in or the obstacles I would have to face on this enriching journey.<br></br><br></br>

                Everything started for me with my participation in the European Innovation Academy. It was definitely a pivotal gateway into the entrepreneurial environment. Shortly after, together with other program participants, we founded UPSTART, a student community, with the mission of sowing entrepreneurship in the academic ecosystem, proving to students the existence of more than one possible path.<br></br><br></br>

                Since I was young, I have always been very interested in various topics, having studied many different areas, from languages to various sciences. <br></br><br></br>

                Where does the phrase with which I start this summary come from? From a young age, I developed a deep connection with sports. This particular phrase was ingrained in me during my time as a tennis player, and I carry it with me as inspiration for navigating through challenges and projects that come my way.

              </p>
            </div>
          </div>

          {/* O que me define enquanto developer? */}
          <div className="group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-700 to-red-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                What defines me as a developer?
              </h2>
            </div>
            
            <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-200">
              <p className="text-lg md:text-xl text-slate-700 leading-relaxed hyphens-auto text-justify">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom separator */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-white via-gray-100 to-white" />
    </section>
  )
}
