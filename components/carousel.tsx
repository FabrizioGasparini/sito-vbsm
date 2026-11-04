"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import { Navigation, Pagination } from "swiper/modules"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Swiper as Sw } from "swiper/types"

interface ArticleCarouselProps {
    immagini: string[]
    title: string
}

export function ArticleCarousel({ immagini, title }: ArticleCarouselProps) {
    const [swiperRef, setSwiperRef] = useState<SwiperClass>();
    const [currentHeight, setCurrentHeight] = useState<number>(0)
    const imgRefs = useRef<HTMLImageElement[]>([])

    const handleSlideChange = (swiper: Sw) => {
        const idx = swiper.activeIndex
        const img = imgRefs.current[idx]
        if (img) setCurrentHeight(img.naturalHeight)
    }

    useEffect(() => {
        if (immagini.length > 0 && imgRefs.current[0]) {
            setCurrentHeight(imgRefs.current[0].naturalHeight)
        }
    }, [immagini])


    const handlePrevious = useCallback(() => {
        swiperRef?.slidePrev();
    }, [swiperRef]);

    const handleNext = useCallback(() => {
        swiperRef?.slideNext();
    }, [swiperRef]);

    return (
        <div className="w-full max-w-3xl mx-auto flex items-center gap-8">
            <div>
                <button onClick={handlePrevious}>
                    <ArrowLeft size={60} />
                </button>
            </div>
            <Swiper
                modules={[Navigation, Pagination]}
                pagination={{ clickable: true, type: "bullets" }}
                spaceBetween={20}
                slidesPerView={1}
                allowSlideNext={true}
                onSlideChange={handleSlideChange}
                onSwiper={setSwiperRef}
            >
                {immagini.map((img, idx) => (
                    <SwiperSlide key={idx}>
                        <div
                            className="flex justify-center items-center transition-[height] duration-300"
                            style={{ height: currentHeight ? `${currentHeight}px` : "auto" }}
                        >
                            <img
                                ref={(el) => { imgRefs.current[idx] = el!; }}
                                src={img}
                                alt={`${title} - immagine ${idx + 1}`}
                                className="rounded-lg shadow-lg w-auto max-w-full h-auto"
                                onLoad={(e) => {
                                    if (idx === 0) setCurrentHeight(e.currentTarget.naturalHeight)
                                }}
                            />
                        </div>
                    </SwiperSlide>
                ))}

            </Swiper>
            <div>
                <button onClick={handleNext}>
                    <ArrowRight size={60} />
                </button>
            </div>
        </div>
    )
}
