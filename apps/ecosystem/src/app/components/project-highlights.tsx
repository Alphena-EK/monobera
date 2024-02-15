import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Badge } from "@bera/ui/badge";
import { Button } from "@bera/ui/button";
import { Icons } from "@bera/ui/icons";
import { Skeleton } from "@bera/ui/skeleton";

const highlights = [
  {
    title: "Title 1",
    link: "",
    image: "https://via.placeholder.com/150",
    tags: ["Validator"],
  },
  {
    title: "Title 2",
    link: "",
    image: "https://via.placeholder.com/150",
    tags: ["Bera"],
  },
  {
    title: "Title 3",
    link: "",
    image: "https://via.placeholder.com/150",
    tags: ["Bera"],
  },
  {
    title: "Title 4",
    link: "",
    image: "https://via.placeholder.com/150",
    tags: ["Bera"],
  },
  {
    title: "Title 5",
    link: "",
    image: "https://via.placeholder.com/150",
    tags: ["Bera"],
  },
  {
    title: "Title 6",
    link: "",
    image: "https://via.placeholder.com/150",
    tags: ["Bera"],
  },
  {
    title: "Title 7",
    link: "",
    image: "https://via.placeholder.com/150",
    tags: ["Bera"],
  },
  {
    title: "Title 8",
    link: "",
    image: "https://via.placeholder.com/150",
    tags: ["Validator", "Staking", "Bera"],
  },
  {
    title: "Title 9",
    link: "",
    image: "https://via.placeholder.com/150",
    tags: ["Validator", "Bera"],
  },
  {
    title: "Title 10",
    link: "",
    image: "https://via.placeholder.com/150",
    tags: ["Validator", "Staking"],
  },
];

export default function ProjectHighlights() {
  const [currentIndex, setCurrentIndex] = useState(1); // Start from 1 because of the duplicated first item at the beginning
  const [itemWidth, setItemWidth] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sliderRef.current) {
      const firstChild = sliderRef.current.children[0] as HTMLElement;
      console.log(firstChild, firstChild.offsetWidth, itemWidth, "?????");
      setItemWidth(firstChild.offsetWidth);
    }
  }, []);

  useEffect(() => {
    if (!sliderRef.current) return;

    const maxScrollPosition = itemWidth * highlights.length; // Calculate max scroll position
    const updatePosition = () => {
      let newPosition = currentIndex * itemWidth;
      if (newPosition >= maxScrollPosition) {
        newPosition = itemWidth; // Reset to first item position
        setCurrentIndex(1);
      } else if (newPosition <= 0) {
        newPosition = itemWidth * highlights.length; // Move to last item position
        setCurrentIndex(highlights.length);
      }
      sliderRef.current.style.transform = `translateX(-${newPosition}px)`;
    };

    updatePosition();
  }, [currentIndex, itemWidth, highlights.length]);

  const goToPrevious = () => {
    if (sliderRef.current) {
      sliderRef.current.style.transition = "transform 0.5s ease-in-out";
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (sliderRef.current) {
      sliderRef.current.style.transition = "transform 0.5s ease-in-out";
      setCurrentIndex(currentIndex + 1);
    }
  };

  const itemsForLooping = [
    highlights[highlights.length - 2],
    highlights[highlights.length - 1],
    ...highlights,
    highlights[0],
    highlights[1],
  ];

  return (
    <div className="w-[1280px] px-0 pb-16 pt-[64px]">
      <div className="flex max-w-[1280px] items-center justify-between px-4 py-8">
        <div className="text-5xl font-bold leading-[48px] text-foreground">
          Project Spotlight
        </div>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex space-x-4">
            <Button onClick={goToPrevious} className="rounded-full">
              <Icons.arrowLeft />
            </Button>
            <Button onClick={goToNext} className="rounded-full">
              <Icons.arrowRight />
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={sliderRef}
        className="mt-4 flex w-[200%] max-w-lg snap-x gap-4 scroll-smooth whitespace-nowrap transition-transform duration-300 ease-linear lg:flex"
        onTouchStart={(e) => e.stopPropagation()}
        style={{ transform: `translateX(-${currentIndex * itemWidth - 16}px)` }}
      >
        {itemsForLooping.map((section, index) => (
          <Link href={section.link} key={index} target="_blank">
            <div className="m-2 mx-auto flex h-[266px] w-[266px] snap-center flex-col items-center justify-center rounded-md border border-solid bg-background hover:opacity-80 hover:shadow-xl">
              <Skeleton className="rounded-2 h-[148px] w-[240px]" />
              <div className="flex w-[266px] items-center justify-between px-4 py-2">
                <div className="text-xl font-semibold text-foreground">
                  {section.title}
                </div>
                <div className="flex flex-row gap-2 text-foreground">
                  {section.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="info"
                      className="flex items-center justify-center text-[10px]"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="mx-4 text-center text-sm leading-5 text-muted-foreground">
                Lorem Ipsum Saint
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
