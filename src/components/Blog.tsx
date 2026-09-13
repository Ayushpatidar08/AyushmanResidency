import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Tag, ArrowRight, CheckCircle2, Building2 } from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  author: string;
  image: string;
  content: {
    heading: string;
    paragraphs: string[];
    keyPoints?: string[];
  }[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'flats-in-rau-indore-investment-guide',
    title: 'Why Buying a Flat in Rau Road, Indore is the Best Real Estate Investment in 2026',
    excerpt: 'Explore why Rau has become Indore’s most sought-after residential destination near Medi-Caps University, IIM Indore, and the upcoming infrastructure developments.',
    date: 'September 10, 2026',
    readTime: '5 min read',
    category: 'Real Estate Trends',
    author: 'Ayushman Advisory Team',
    image: '/hero-bg.webp',
    content: [
      {
        heading: 'Strategic Location & Highway Connectivity',
        paragraphs: [
          'Rau has transformed from a quiet suburb into Indore’s premier educational and residential hotspot. Situated directly along the AB Road (NH-52) and the Indore Bypass, residents enjoy seamless travel to both Indore City Centre and industrial hubs like Pithampur.',
          'With prominent institutions such as Medi-Caps University, IIM Indore, and top international schools within minutes, rental yield and property appreciation rates in Rau consistently outpace older city sectors.'
        ],
        keyPoints: [
          'Direct connectivity to AB Road NH-52 within 1.0 km',
          'Less than 25 minutes drive to Devi Ahilyabai Holkar International Airport',
          'High demand from university faculty, corporate professionals, and families'
        ]
      },
      {
        heading: 'Infrastructure & Community Living at Ayushman Residency',
        paragraphs: [
          'Modern buyers prioritize gated security, dedicated parking, and open recreational spaces. Ayushman Residency delivers all of these with G+6 multi-story residential towers, 50-feet wide campus roads, and landscaped green zones.',
          'Over 400+ families already reside here, enjoying 24x7 water supply, reliable power backup, and dedicated Mahadev temple on the premises.'
        ]
      }
    ]
  },
  {
    id: '2',
    slug: '1bhk-vs-2bhk-vs-3bhk-flat-comparison',
    title: '1 BHK vs 2 BHK vs 3 BHK Flats at Ayushman Residency: Which Plan Fits Your Needs?',
    excerpt: 'Detailed comparison of carpet area, layout efficiency, balconies, and family suitability across 540 sq.ft, 1050 sq.ft, and 1200 sq.ft luxury flats.',
    date: 'September 05, 2026',
    readTime: '6 min read',
    category: 'Buying Guide',
    author: 'Ayushman Architectural Desk',
    image: '/2bhk-plan.webp',
    content: [
      {
        heading: 'Compact Luxury: 1 BHK Flat (540 sq.ft)',
        paragraphs: [
          'Tailored for working bachelors, students, young couples, and astute rental investors. Features a smart modular kitchen, comfortable living lounge, attached washroom, and an airy balcony.'
        ],
        keyPoints: [
          'High rental yield due to proximity to Medi-Caps University',
          'Low maintenance and highly affordable entry price tag',
          'Instant possession available'
        ]
      },
      {
        heading: 'The Family Favorite: 2 BHK Flat (1050 sq.ft)',
        paragraphs: [
          'Our most popular configuration engineered for nuclear and growing families. Features 2 expansive bedrooms, 2 bathrooms, an expansive hall, and 3 distinct balconies for maximum light and cross-ventilation.'
        ]
      },
      {
        heading: 'Uncompromised Luxury: 3 BHK Residence (1200 sq.ft)',
        paragraphs: [
          'Designed for those who desire space, exclusivity, and corner views. Three large bedrooms, three washrooms, dual private balconies, and premium sanitary fittings.'
        ]
      }
    ]
  },
  {
    id: '3',
    slug: 'amenities-and-lifestyle-ayushman-residency-rau',
    title: 'Top Lifestyle Amenities Every Home Buyer Deserves: What Sets Ayushman Residency Apart',
    excerpt: 'From 50-feet campus gaps ensuring natural ventilation to 24/7 CCTV surveillance, discover how modern amenities enhance everyday living.',
    date: 'August 28, 2026',
    readTime: '4 min read',
    category: 'Lifestyle & Community',
    author: 'Ayushman Living Desk',
    image: '/gallery-5.webp',
    content: [
      {
        heading: 'Prioritizing Natural Light & Ventilation',
        paragraphs: [
          'Unlike cluttered developments, Ayushman Residency features generous 50-feet wide gaps between residential blocks. This guarantees uninhibited airflow, abundant sunlight, and total privacy for every single apartment.'
        ]
      },
      {
        heading: 'Complete Security & Peace of Mind',
        paragraphs: [
          'A single-gated entry and exit system coupled with round-the-clock CCTV surveillance guarantees safety for children playing in the gardens and senior citizens strolling in the evening.'
        ],
        keyPoints: [
          'Dedicated Mahadev Temple within the campus',
          'Expansive covered and ground parking facilities',
          'Children play zone with lush landscape greenery'
        ]
      }
    ]
  }
];

export function Blog() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedPost]);

  return (
    <div className="min-h-screen bg-dark text-white pt-[120px] pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation */}
        <div className="mb-8">
          {selectedPost ? (
            <button
              onClick={() => setSelectedPost(null)}
              className="inline-flex items-center space-x-2 text-white/50 hover:text-gold transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to All Articles</span>
            </button>
          ) : (
            <Link 
              to="/" 
              className="inline-flex items-center space-x-2 text-white/50 hover:text-gold transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </Link>
          )}
        </div>

        {selectedPost ? (
          /* Single Blog Post View */
          <motion.article 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="flex items-center gap-3 text-xs text-gold font-bold uppercase tracking-wider mb-3">
              <span>{selectedPost.category}</span>
              <span>•</span>
              <span>{selectedPost.readTime}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">
              {selectedPost.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-white/50 mb-8 border-b border-white/10 pb-6">
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {selectedPost.author}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {selectedPost.date}</span>
            </div>

            <div className="rounded-3xl overflow-hidden mb-8 border border-white/10 aspect-video bg-black">
              <img src={selectedPost.image} alt={selectedPost.title} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-8 text-white/80 leading-relaxed font-light text-base sm:text-lg">
              {selectedPost.content.map((sec, i) => (
                <div key={i} className="space-y-4">
                  <h2 className="text-2xl font-serif font-bold text-gold">{sec.heading}</h2>
                  {sec.paragraphs.map((p, pi) => (
                    <p key={pi}>{p}</p>
                  ))}
                  {sec.keyPoints && (
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-2 mt-4">
                      {sec.keyPoints.map((pt, pti) => (
                        <div key={pti} className="flex items-start gap-2.5 text-sm text-white/90">
                          <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 p-8 bg-gradient-to-r from-gold/15 to-transparent rounded-3xl border border-gold/30 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-serif font-bold text-white mb-1">Looking for a Flat in Rau?</h3>
                <p className="text-xs text-white/60">Schedule a priority VIP site visit at Ayushman Residency today.</p>
              </div>
              <Link 
                to="/#contact"
                className="px-6 py-3 bg-gold text-dark font-bold rounded-xl text-xs uppercase tracking-wider hover:scale-105 transition-transform shrink-0"
              >
                Book Site Visit
              </Link>
            </div>
          </motion.article>
        ) : (
          /* Blog Post Listing View */
          <div>
            <div className="mb-12 text-center max-w-2xl mx-auto">
              <span className="text-gold font-bold uppercase tracking-[0.3em] text-xs mb-2 block">
                Official Insights & Guides
              </span>
              <h1 className="text-3xl md:text-5xl font-serif text-white font-bold mb-3">
                Ayushman Residency <span className="italic text-gold">Blog & Insights</span>
              </h1>
              <p className="text-white/60 text-sm leading-relaxed">
                Expert real estate advice, market trends in Rau Indore, architectural floor plan comparisons, and lifestyle benefits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {BLOG_POSTS.map((post, idx) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedPost(post)}
                  className="bg-white/5 rounded-3xl overflow-hidden border border-white/10 hover:border-gold/50 hover:bg-white/[0.08] transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="aspect-[16/10] overflow-hidden relative bg-black">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute top-3 left-3 bg-dark/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-gold">
                        {post.category}
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-3 text-[11px] text-white/40 mb-2">
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>
                      <h2 className="text-lg font-serif font-bold text-white group-hover:text-gold transition-colors line-clamp-2 mb-2">
                        {post.title}
                      </h2>
                      <p className="text-white/50 text-xs leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex items-center text-xs font-bold text-gold uppercase tracking-wider gap-1.5 group-hover:translate-x-1 transition-transform">
                    <span>Read Full Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
