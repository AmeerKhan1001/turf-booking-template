"use client";

import { MapPinIcon, PhoneIcon, Navigation, ExternalLink } from "lucide-react";

export default function Footer() {
  const address = "FreeHit Squad ( Turf ), Nirmala Matha, School Rd, near Nirmala Matha School, Rathinapuri, Edayarpalayam, Coimbatore, Kuniyamuthur, Tamil Nadu 641008";
  const mapsUrl = `https://maps.app.goo.gl/vumGPsqyNFpJj34J6`;

  return (
    <footer className="bg-neutral-900 text-neutral-400 mt-8 pt-8 pb-0 border-t border-neutral-800">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 max-w-6xl pb-8">
        <div className="flex flex-col md:flex-row md:justify-between gap-8 md:gap-12">
          {/* Company Info Section */}
          <div className="flex-1 min-w-0 space-y-4">
            <h3 className="text-white text-2xl font-bold mb-2 tracking-tight">FreeHit Squad</h3>
            <p className="text-base leading-relaxed max-w-md">
              Book your slots now in a Multi-Sports Turf in a lush Green Space.<br />
              <span className="text-neutral-300">Experience Football, Cricket, Shuttle, Volleyball, and more.</span>
            </p>
            {/* Location CTA */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 p-3 rounded-xl bg-neutral-800/60 hover:bg-blue-900/30 transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 mt-2"
              aria-label="Open location in Google Maps"
            >
              <MapPinIcon className="w-6 h-6 text-blue-500 flex-shrink-0" />
              <span className="font-semibold text-white text-base">{address.split(",")[0]}</span>
              <span className="ml-auto flex items-center gap-1 text-blue-400 text-xs font-medium">
                <Navigation className="w-4 h-4" />
                Get directions
              </span>
            </a>
          </div>

          {/* QR Code & Socials */}
          <div className="flex flex-col gap-6 items-center md:items-end md:w-96">
            {/* QR Code Section */}
            <div className="bg-neutral-800/60 p-4 rounded-xl flex flex-col items-center w-full max-w-xs">
              <img
                src="/qr-addr.png"
                alt="Location QR Code"
                className="w-40 h-40 rounded shadow-md border border-neutral-700"
              />
              <div className="flex items-center justify-center gap-2 mt-3 w-full">
                <span className="text-white text-sm font-medium bg-neutral-700/40 rounded-full px-3 py-1">Scan QR</span>
                <span className="text-neutral-500 text-xs">or</span>
                <button
                  onClick={() => window.open(mapsUrl, '_blank')}
                  className="flex items-center gap-1 bg-blue-500/10 text-blue-400 rounded-full px-3 py-1 text-sm font-medium hover:bg-blue-500/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  aria-label="Open in Maps"
                >
                  Open in Maps
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-row gap-3 mt-2 w-full justify-center md:justify-end">
              <a
                href="tel:+919344898819"
                className="group flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800/60 hover:bg-green-900/30 transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                aria-label="Call FreeHit Squad"
              >
                <PhoneIcon className="w-5 h-5 text-green-400" />
                <span className="font-semibold text-white text-base">Call</span>
              </a>
              <a
                href="https://www.instagram.com/freehit_squad/"
                className="group flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800/60 hover:bg-pink-900/30 transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span className="font-semibold text-white text-base">Instagram</span>
              </a>
              <a
                href="https://wa.me/919344898819"
                className="group flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800/60 hover:bg-green-900/30 transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.90-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="font-semibold text-white text-base">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="bg-neutral-900 border-t border-neutral-800 py-4">
        <div className="container mx-auto px-4 max-w-6xl">
          <p className="text-neutral-500 text-sm text-center">
            Built by
            <a href="https://lighine.com" target="_blank" rel="noopener noreferrer" className="text-white font-semibold underline ml-1">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Ligh
              </span>
              <span className="text-white">ine</span>
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}