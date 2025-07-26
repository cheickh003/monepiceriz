import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';

interface Testimonial {
    id: number;
    name: string;
    rating: number;
    comment: string;
    date: string;
    initials: string;
}

interface TestimonialsSectionProps {
    className?: string;
}

export default function TestimonialsSection({ className }: TestimonialsSectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerView, setItemsPerView] = useState(3);

    const testimonials: Testimonial[] = [
        {
            id: 1,
            name: "Marie Dupont",
            rating: 5,
            comment: "Excellent service et produits toujours frais ! Je commande régulièrement et je suis toujours satisfaite de la qualité.",
            date: "Il y a 1 semaine",
            initials: "MD"
        },
        {
            id: 2,
            name: "Jean Martin",
            rating: 5,
            comment: "Les épices sont d'une qualité exceptionnelle. La livraison est rapide et les produits sont bien emballés.",
            date: "Il y a 2 semaines",
            initials: "JM"
        },
        {
            id: 3,
            name: "Sophie Bernard",
            rating: 4,
            comment: "Grande variété de produits et prix compétitifs. Le service client est très réactif en cas de besoin.",
            date: "Il y a 3 semaines",
            initials: "SB"
        },
        {
            id: 4,
            name: "Pierre Dubois",
            rating: 5,
            comment: "Je recommande vivement ! Les légumes sont toujours frais et la sélection d'épices est impressionnante.",
            date: "Il y a 1 mois",
            initials: "PD"
        },
        {
            id: 5,
            name: "Nathalie Moreau",
            rating: 5,
            comment: "Mon épicerie en ligne préférée ! La qualité est au rendez-vous et les délais de livraison sont respectés.",
            date: "Il y a 1 mois",
            initials: "NM"
        },
        {
            id: 6,
            name: "Ahmed Benali",
            rating: 4,
            comment: "Très satisfait de mes achats. Les produits correspondent parfaitement à la description et sont de bonne qualité.",
            date: "Il y a 2 mois",
            initials: "AB"
        }
    ];

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setItemsPerView(1);
            } else if (window.innerWidth < 1024) {
                setItemsPerView(2);
            } else {
                setItemsPerView(3);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                const maxIndex = testimonials.length - itemsPerView;
                return prevIndex >= maxIndex ? 0 : prevIndex + 1;
            });
        }, 5000);

        return () => clearInterval(timer);
    }, [itemsPerView, testimonials.length]);

    const handlePrevious = () => {
        setCurrentIndex((prevIndex) => {
            const maxIndex = testimonials.length - itemsPerView;
            return prevIndex === 0 ? maxIndex : prevIndex - 1;
        });
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => {
            const maxIndex = testimonials.length - itemsPerView;
            return prevIndex >= maxIndex ? 0 : prevIndex + 1;
        });
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, index) => (
                    <Star
                        key={index}
                        className={cn(
                            "w-4 h-4",
                            index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        )}
                    />
                ))}
            </div>
        );
    };

    return (
        <section className={cn("py-16 bg-white", className)}>
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Ce que disent nos clients
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Découvrez les avis de nos clients satisfaits qui nous font confiance pour leurs achats quotidiens
                    </p>
                </div>

                <div className="relative">
                    <div className="overflow-hidden">
                        <div 
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
                        >
                            {testimonials.map((testimonial) => (
                                <div 
                                    key={testimonial.id}
                                    className={cn(
                                        "flex-shrink-0 px-3",
                                        itemsPerView === 1 ? "w-full" : itemsPerView === 2 ? "w-1/2" : "w-1/3"
                                    )}
                                >
                                    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-green-600 font-semibold">
                                                        {testimonial.initials}
                                                    </span>
                                                </div>
                                                <div className="flex-grow">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {testimonial.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {testimonial.date}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {renderStars(testimonial.rating)}
                                            
                                            <p className="mt-4 text-gray-700 text-sm leading-relaxed">
                                                "{testimonial.comment}"
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>

                    {testimonials.length > itemsPerView && (
                        <>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handlePrevious}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg hover:bg-gray-100"
                                aria-label="Témoignage précédent"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleNext}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg hover:bg-gray-100"
                                aria-label="Témoignage suivant"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                </div>

                <div className="flex justify-center mt-8 gap-2">
                    {[...Array(Math.max(1, testimonials.length - itemsPerView + 1))].map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={cn(
                                "w-2 h-2 rounded-full transition-all duration-300",
                                currentIndex === index ? "w-8 bg-green-600" : "bg-gray-300"
                            )}
                            aria-label={`Aller au témoignage ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}