"use client";

import { MapPinIcon, PhoneIcon, Navigation, Star, Clock, Users } from "lucide-react";

export default function Footer() {
  const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME;
  const businessDescription = process.env.NEXT_PUBLIC_BUSINESS_DESCRIPTION;
  const businessTagline = process.env.NEXT_PUBLIC_BUSINESS_TAGLINE;
  const phoneNumber = process.env.NEXT_PUBLIC_PHONE_NUMBER;
  const instagramHandle = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE;
  const mapsUrl = process.env.NEXT_PUBLIC_MAPS_URL;
  const address = process.env.NEXT_PUBLIC_ADDRESS;

  return (
    <footer className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 text-neutral-300 mt-12 border-t border-neutral-700/50">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 max-w-6xl py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Company Info Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <h3 className="text-white text-3xl font-bold tracking-tight bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                {businessName}
              </h3>
              <p className="text-lg leading-relaxed text-neutral-300 max-w-2xl">
                {businessDescription}
              </p>
              <p className="text-base text-neutral-400 max-w-2xl">
                {businessTagline}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-800/40 border border-neutral-700/30">
                <Clock className="w-6 h-6 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold text-sm">Open Daily</p>
                  <p className="text-neutral-400 text-xs">6:00 AM - 2:00 AM</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-800/40 border border-neutral-700/30">
                <Users className="w-6 h-6 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold text-sm">Multi-Sport</p>
                  <p className="text-neutral-400 text-xs">Play what you love</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-800/40 border border-neutral-700/30">
                <Star className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold text-sm">Premium</p>
                  <p className="text-neutral-400 text-xs">Quality facilities</p>
                </div>
              </div>
            </div>

            {/* Location CTA */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-neutral-800/60 to-neutral-800/40 hover:from-blue-900/30 hover:to-blue-800/30 transition-all duration-300 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 border border-neutral-700/30 hover:border-blue-500/30"
              aria-label="Open location in Google Maps"
            >
              <MapPinIcon className="w-7 h-7 text-blue-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-base mb-1">{address?.split(",")[0]}</p>
                <p className="text-neutral-400 text-sm truncate">{address?.split(",").slice(1).join(",").trim()}</p>
              </div>
              <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                <Navigation className="w-4 h-4" />
                <span className="hidden sm:inline">Get directions</span>
              </div>
            </a>
          </div>

          {/* Contact & Social Section */}
          <div className="space-y-6">
            <div>
              <h4 className="text-white text-xl font-bold mb-4">Get in Touch</h4>
              <div className="space-y-3">
                <a
                  href={`tel:+91${phoneNumber}`}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-green-600/10 hover:from-green-500/20 hover:to-green-600/20 transition-all duration-300 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 border border-green-500/20"
                  aria-label={`Call ${businessName}`}
                >
                  <PhoneIcon className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="font-semibold text-white text-sm">Call Now</p>
                    <p className="text-green-300 text-sm">+91 {phoneNumber}</p>
                  </div>
                </a>

                <a
                  href={`https://wa.me/91${phoneNumber}`}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-green-600/10 hover:from-green-500/20 hover:to-green-600/20 transition-all duration-300 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 border border-green-500/20"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                >
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.90-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-white text-sm">WhatsApp</p>
                    <p className="text-green-300 text-sm">Quick response</p>
                  </div>
                </a>

                <a
                  href={`https://www.instagram.com/${instagramHandle}/`}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-600/10 hover:from-pink-500/20 hover:to-purple-600/20 transition-all duration-300 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 border border-pink-500/20"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-white text-sm">Instagram</p>
                    <p className="text-pink-300 text-sm">@{instagramHandle}</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="bg-neutral-900/80 border-t border-neutral-700/50 py-6">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-neutral-400 text-sm">
              © 2025 {businessName}. All rights reserved.
            </p>
            <p className="text-neutral-500 text-sm">
              Built with ❤️ by{" "}
              <a 
                href="https://lighine.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-semibold hover:text-white transition-colors"
              >
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Ligh
                </span>
                <span className="text-white">ine</span>
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}