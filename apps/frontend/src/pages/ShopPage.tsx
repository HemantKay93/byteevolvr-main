import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductService, Product } from '@byteevolvr/api-client';
import {
  Loader2,
  Zap,
  ArrowRight,
  Gamepad2,
  Flame,
  Tag,
  Sparkles,
  TrendingUp,
  Grid,
} from 'lucide-react';

import { CountdownTimer } from '../components/shop/CountdownTimer';
import { ProductSlider } from '../components/shop/ProductSlider';

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const heroSlides = [
    {
      id: 1,
      image:
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop',
      badge: 'AVAILABLE NOW',
      title: 'UNLOCK NEXT-GEN PERFORMANCE',
      subtitle:
        'Engineered for precision. Built for power. Experience the zenith of portable gaming with our all-new NEON series laptops.',
      link: '/shop/category/laptops',
      productLink: '/shop/product/1', // Example direct link for technical specs
    },
    {
      id: 2,
      image:
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
      badge: 'NEW ARRIVAL',
      title: 'IMMERSIVE 4K DISPLAYS',
      subtitle:
        'See every detail with crystal clarity. Upgrade your battlestation with our latest ultra-wide curved monitors.',
      link: '/shop/category/monitors',
      productLink: '/shop/product/2',
    },
    {
      id: 3,
      image:
        'https://images.unsplash.com/photo-1587831990711-23ca6441447b?q=80&w=2000&auto=format&fit=crop',
      badge: 'CUSTOM BUILDS',
      title: 'BUILD YOUR DREAM RIG',
      subtitle:
        'Custom tailored desktop PCs designed to crush any workload and dominate every game without breaking a sweat.',
      link: '/shop/category/pcs',
      productLink: '/shop/product/3',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const productsSectionRef = useRef<HTMLDivElement>(null);

  // Auto slider and keyboard navigation
  useEffect(() => {
    const sliderInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(sliderInterval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSlide, heroSlides.length]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await ProductService.getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    void fetchProducts();
  }, []);

  const calculateAvgRating = (product: Product) => {
    if (!product.reviews || product.reviews.length === 0) return 0;
    const sum = product.reviews.reduce((acc, rev) => acc + rev.rating, 0);
    return sum / product.reviews.length;
  };

  const getTags = (product: Product) => (product.tags || []).map((t) => t.toLowerCase());

  // Derive Sections
  const dealOfTheDay = products.filter(
    (p) => getTags(p).includes('deal of the day') || getTags(p).includes('dod')
  );
  const clearanceSale = products.filter((p) => getTags(p).includes('clearance'));
  const newArrivals = products.filter((p) => getTags(p).includes('new'));
  const trending = [...products]
    .sort((a, b) => calculateAvgRating(b) - calculateAvgRating(a))
    .slice(0, 4);

  return (
    <div className="w-full pt-20">
      {' '}
      {/* pt-20 pushes content below the fixed header nav */}
      {/* Announcement Bar */}
      <div className="h-10 bg-gradient-to-r from-stitch-primary/80 to-stitch-secondary/80 text-white flex items-center justify-center text-sm font-medium overflow-hidden z-40 relative">
        <div className="flex items-center gap-2 animate-pulse">
          <Zap className="w-4 h-4 fill-white text-white" />
          <span>Flash Sale: Up to 40% off Gaming Laptops!</span>
        </div>
      </div>
      <main className="w-full">
        {/* Dynamic Hero Slider */}
        <section className="relative h-[650px] w-full mb-stitch-section-gap overflow-hidden bg-stitch-surface">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <img
                className="w-full h-full object-cover brightness-[0.4]"
                src={slide.image}
                alt={slide.title}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'low'}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stitch-background via-stitch-background/60 to-transparent"></div>

              <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 max-w-7xl mx-auto">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 mb-6 bg-stitch-primary/10 border border-stitch-primary/20 backdrop-blur-md px-4 py-1.5 rounded-full w-fit">
                    <span className="w-2 h-2 rounded-full bg-stitch-secondary animate-pulse shadow-[0_0_8px_rgba(173,198,255,0.8)]"></span>
                    <span className="text-stitch-secondary text-xs font-bold uppercase tracking-widest">
                      {slide.badge}
                    </span>
                  </div>

                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight text-white tracking-tight flex items-center gap-4">
                    {slide.title}
                  </h1>

                  <p className="text-lg md:text-xl text-stitch-on-surface-variant mb-10 max-w-2xl leading-relaxed">
                    {slide.subtitle}
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() =>
                        productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
                      }
                      className="px-8 py-4 bg-stitch-primary text-stitch-on-primary font-bold rounded-lg hover:bg-stitch-primary/90 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2"
                    >
                      Shop Now <ArrowRight className="w-5 h-5" />
                    </button>
                    <Link
                      to={slide.productLink}
                      className="px-8 py-4 stitch-glass-panel text-white border border-white/20 font-bold rounded-lg hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                      <Gamepad2 className="w-5 h-5" /> Technical Specs
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Slider Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-20">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className="group relative p-2 -m-2 flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-stitch-primary rounded-full"
                aria-label={`Go to slide ${idx + 1}`}
                aria-current={idx === currentSlide ? 'true' : 'false'}
              >
                <div
                  className={`transition-all duration-300 rounded-full overflow-hidden ${
                    idx === currentSlide
                      ? 'w-12 h-2 bg-stitch-primary/30 shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                      : 'w-2 h-2 bg-white/40 group-hover:bg-white/70'
                  }`}
                >
                  {idx === currentSlide && (
                    <div
                      key={currentSlide}
                      className="h-full bg-stitch-primary rounded-full animate-carousel-progress origin-left"
                      style={{
                        animationDuration: '6000ms',
                        animationTimingFunction: 'linear',
                        animationFillMode: 'forwards',
                      }}
                    />
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* CMS Image Category Grid */}
        <section className="px-stitch-container-padding-mobile md:px-stitch-container-padding-desktop max-w-7xl mx-auto mb-stitch-section-gap">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/shop/category/laptops"
              className="relative h-48 rounded-2xl overflow-hidden group border border-stitch-outline-variant/20 hover:border-stitch-primary/60 transition-all"
            >
              <img
                src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=500&q=80"
                alt="Laptops"
                className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:brightness-75 group-hover:scale-105 transition-all duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center justify-end pb-6">
                <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-1">
                  Laptops
                </h3>
                <span className="text-xs text-stitch-primary font-medium tracking-widest group-hover:opacity-100 opacity-80 transition-opacity">
                  Browse Systems
                </span>
              </div>
            </Link>

            <Link
              to="/shop/category/pcs"
              className="relative h-48 rounded-2xl overflow-hidden group border border-stitch-outline-variant/20 hover:border-stitch-secondary/60 transition-all"
            >
              <img
                src="https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=500&q=80"
                alt="Gaming PCs"
                className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:brightness-75 group-hover:scale-105 transition-all duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center justify-end pb-6">
                <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-1">
                  Gaming PCs
                </h3>
                <span className="text-xs text-stitch-secondary font-medium tracking-widest group-hover:opacity-100 opacity-80 transition-opacity">
                  Configure Tower
                </span>
              </div>
            </Link>

            <Link
              to="/shop/category/accessories"
              className="relative h-48 rounded-2xl overflow-hidden group border border-stitch-outline-variant/20 hover:border-stitch-tertiary/60 transition-all"
            >
              <img
                src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=500&q=80"
                alt="Accessories"
                className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:brightness-75 group-hover:scale-105 transition-all duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center justify-end pb-6">
                <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-1">
                  Accessories
                </h3>
                <span className="text-xs text-stitch-tertiary font-medium tracking-widest group-hover:opacity-100 opacity-80 transition-opacity">
                  Level Up Gear
                </span>
              </div>
            </Link>

            <Link
              to="/shop/category/monitors"
              className="relative h-48 rounded-2xl overflow-hidden group border border-stitch-outline-variant/20 hover:border-stitch-primary-fixed-dim/60 transition-all"
            >
              <img
                src="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=500&q=80"
                alt="Monitors"
                className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:brightness-75 group-hover:scale-105 transition-all duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center justify-end pb-6">
                <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-1">
                  Monitors
                </h3>
                <span className="text-xs text-stitch-primary-fixed-dim font-medium tracking-widest group-hover:opacity-100 opacity-80 transition-opacity">
                  Ultra-Wide Visuals
                </span>
              </div>
            </Link>
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-stitch-primary" />
          </div>
        ) : (
          <div ref={productsSectionRef} id="product-catalog" className="max-w-7xl mx-auto">
            {/* Deals of the Day */}
            {dealOfTheDay.length > 0 && (
              <section className="px-stitch-container-padding-mobile md:px-stitch-container-padding-desktop mb-stitch-section-gap">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-stitch-outline-variant/20 pb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2 text-white">
                      <Flame className="w-8 h-8 text-stitch-error fill-stitch-error/20" />
                      <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
                        DEALS OF THE DAY
                      </h2>
                    </div>
                    <p className="text-sm text-stitch-outline uppercase tracking-widest font-medium">
                      High-performance tech at legendary prices
                    </p>
                  </div>
                  <CountdownTimer />
                </div>

                <ProductSlider products={dealOfTheDay} label="CLAIM DEAL" />
              </section>
            )}

            {/* Clearance Sale */}
            {clearanceSale.length > 0 && (
              <section className="px-stitch-container-padding-mobile md:px-stitch-container-padding-desktop mb-stitch-section-gap">
                <div className="mb-8 border-b border-stitch-outline-variant/20 pb-4">
                  <div className="flex items-center gap-3 mb-2 text-white">
                    <Tag className="w-8 h-8 text-stitch-tertiary" />
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
                      CLEARANCE SALE
                    </h2>
                  </div>
                  <p className="text-sm text-stitch-outline uppercase tracking-widest font-medium">
                    Final drops. Unbeatable discounts.
                  </p>
                </div>
                <ProductSlider
                  products={clearanceSale}
                  tag="CLEARANCE"
                  tagClass="bg-stitch-tertiary text-stitch-on-tertiary"
                />
              </section>
            )}

            {/* New Arrivals */}
            {newArrivals.length > 0 && (
              <section className="px-stitch-container-padding-mobile md:px-stitch-container-padding-desktop mb-stitch-section-gap">
                <div className="mb-8 border-b border-stitch-outline-variant/20 pb-4">
                  <div className="flex items-center gap-3 mb-2 text-white">
                    <Sparkles className="w-8 h-8 text-stitch-primary" />
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
                      NEW ARRIVALS
                    </h2>
                  </div>
                  <p className="text-sm text-stitch-outline uppercase tracking-widest font-medium">
                    Fresh tech just dropped.
                  </p>
                </div>
                <ProductSlider
                  products={newArrivals}
                  tag="NEW"
                  tagClass="bg-stitch-primary text-stitch-on-primary"
                />
              </section>
            )}

            {/* Trending Hardware */}
            {trending.length > 0 && (
              <section className="px-stitch-container-padding-mobile md:px-stitch-container-padding-desktop mb-stitch-section-gap">
                <div className="mb-8 border-b border-stitch-outline-variant/20 pb-4">
                  <div className="flex items-center gap-3 mb-2 text-white">
                    <TrendingUp className="w-8 h-8 text-stitch-secondary" />
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
                      TRENDING HARDWARE
                    </h2>
                  </div>
                  <p className="text-sm text-stitch-outline uppercase tracking-widest font-medium">
                    Highest rated by the community
                  </p>
                </div>
                <ProductSlider
                  products={trending}
                  tag="TRENDING"
                  tagClass="bg-stitch-secondary text-stitch-on-secondary"
                />
              </section>
            )}
          </div>
        )}

        {/* View All Button */}
        <section className="px-stitch-container-padding-mobile md:px-stitch-container-padding-desktop mb-stitch-section-gap pb-12 flex justify-center">
          <Link
            to="/shop/category/all"
            className="inline-flex items-center gap-3 px-8 py-4 border border-stitch-secondary text-stitch-secondary hover:bg-stitch-secondary hover:text-stitch-on-secondary transition-all font-bold rounded-lg uppercase tracking-widest shadow-[0_0_15px_rgba(173,198,255,0.1)] hover:shadow-[0_0_25px_rgba(173,198,255,0.3)]"
          >
            <Grid className="w-5 h-5" />
            View All Products
          </Link>
        </section>
      </main>
    </div>
  );
}
