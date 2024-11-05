'use client';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useContext } from 'react';
import { inputsContext } from './Context';
import Loading from './Loading';
import 'keen-slider/keen-slider.min.css';
import Image from 'next/image';
import BackButton from './BackButton';
import { TfiMenuAlt } from 'react-icons/tfi';
import SideBarMenu from './SideBarMenu';
import CustomToast from './CustomToast';
import toast from 'react-hot-toast';
import CurrentUser from './CurrentUser';
import { useSession } from 'next-auth/react';
import { MdKeyboardDoubleArrowRight } from 'react-icons/md';

export default function SportPlanet({ vertical = false }) {
  const [pageNumber, setPageNumber] = useState(1);
  const [sport, setSport] = useState([]);
  const { newSeries, deletedSeries, dispatch } = useContext(inputsContext);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const user = CurrentUser();
  const session = useSession();
  const [showMessage, setShowMessage] = useState(true);

  const [sportSliderRef, sportInstanceRef] = useKeenSlider({
    loop: false,
    mode: 'free',
    vertical: vertical ? true : false,
    rtl: vertical ? false : true,
    slides: {
      perView: 3,
      spacing: () => {
        // التحقق من أن الكود يعمل في المتصفح
        if (typeof window !== 'undefined') {
          return window.innerWidth < 768 ? 3 : 17;
        }
        return 17; // القيمة الافتراضية في بيئة السيرفر
      },
    },
    slideChanged(slider) {
      const currentSlide = slider.track.details.rel;
      const totalSlides = slider.track.details.slides.length;

      // جلب المزيد من المسلسلات عند الوصول إلى الشريحة الأخيرة
      if (currentSlide >= totalSlides - 3) {
        setPageNumber((prevPage) => prevPage + 1);
      }
    },
  });

  useEffect(() => {
    fetchSport();
    const timer = setTimeout(() => {
      setShowMessage(false);
    }, 60000);

    // Cleanup timer if the component is unmounted
    return () => clearTimeout(timer);
  }, [newSeries, deletedSeries, pageNumber]);

  useEffect(() => {
    if (sportInstanceRef.current) {
      sportInstanceRef.current.update();
    }
  }, [sport, newSeries]);

  async function fetchSport() {
    try {
      const response = await fetch(
        `/api/serieses?page=${pageNumber}&planetName=رياضة&limit=4`
      );
      const json = await response.json();
      if (response.ok) {
        // console.log('sport', sport);

        const existingIds = new Set(sport.map((series) => series.id));
        const newSport = json.filter((series) => !existingIds.has(series.id));

        if (newSport.length > 0) {
          setSport((prevSport) => [...prevSport, ...newSport]);
        }
      }
    } catch (error) {
      console.error('Error fetching sport:', error);
    }
  }
  async function handleAdd(id) {
    // console.log('id', id);
    const response = await fetch('/api/serieses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id }),
    });
    if (response.ok) {
      toast.custom((t) => (
        <CustomToast
          t={t}
          emoji={'🧀'}
          message={'تم إضافة المسلسل الى الأكثر مشاهدة'}
          greenEmoji={'✔'}
        />
      ));
    }
  }
  return (
    <div className="flex flex-col items-center justify-center w-full overflow-x-hidden p-2 bg-one ">
      {vertical ? (
        <div className="absolute flex flex-col items-start gap-2 z-40 top-2 right-2 sm:top-4 sm:right-4 xl:right-12 xl:top-12">
          <TfiMenuAlt
            className="p-1 rounded-lg text-3xl lg:text-5xl text-white cursor-pointer z-50  bg-two"
            onClick={() => setIsOpen(!isOpen)}
          />
          {isOpen && <SideBarMenu setIsOpen={setIsOpen} />}
        </div>
      ) : (
        ''
      )}

      <>
        <div className="relative h-32 w-52 sm:h-72 sm:w-96">
          <Image
            src={'https://i.imgur.com/CI7HaVo.png'}
            layout="fill"
            objectFit="cover"
            alt={'رياضة'}
          />{' '}
        </div>
      </>
      {vertical ? (
        <>
          <div className="flex items-center w-full px-8">
            <hr className="w-full h-0.5 bg-gray-400 rounded-lg border-hidden " />
          </div>
          <h1 className="w-fit text-start p-2 text-white my-2 bg-one">
            كوكب رياضة
          </h1>
          {/* <BackButton /> */}
        </>
      ) : (
        <h1 className="w-full text-start p-2 text-white my-2 bg-one">
          كوكب رياضة
        </h1>
      )}
      {showMessage && (
        <div className="relative w-full flex items-center justify-between text-white h-12  text-2xl px-2 ">
          <MdKeyboardDoubleArrowRight />

          <h6 className="text-sm w-full text-start">
            {' '}
            اسحب لمزيد من المسلسلات
          </h6>
        </div>
      )}
      <div
        ref={sportSliderRef}
        className={
          (vertical ? 'h-[600px]' : 'h-fit') +
          ' keen-slider  py-2 shadow-lg  overflow-scroll rounded-md'
        }
      >
        {sport.length === 0 ? (
          <Loading />
        ) : (
          // إنقاص أول 4 مسلسلات من العرض
          sport?.map((series) => (
            <div
              key={series.id}
              className="keen-slider__slide snap-center flex flex-col items-center"
            >
              {session?.status === 'authenticated' && user?.isAdmin === '1' && (
                <button
                  className="bg-green-400 rounded-full px-2 my-2 hover:scale-105 w-fit text-center mx-2"
                  onClick={() => handleAdd(series?.id)}
                >
                  إضافة
                </button>
              )}
              <div
                className=" flex flex-col items-center justify-start flex-shrink-0 w-full mr-1"
                key={series?.id}
                onClick={() => {
                  // التنقل إلى الرابط الجديد
                  router.push(
                    `/seriesAndEpisodes?seriesName=${series?.seriesName}`
                  );
                }}
              >
                <div
                  className={
                    (vertical ? 'w-72 h-44' : 'w-24 h-32') +
                    ' relative w-24 h-32 sm:w-full sm:h-64 rounded-md overflow-hidden mx-2 hover:cursor-pointer '
                  }
                >
                  <Image
                    src={series?.seriesImage}
                    layout="fill"
                    objectFit="cover"
                    objectPosition="top" // يحدد موضع الصورة من الأعلى
                    alt={series?.seriesName}
                  />
                </div>
                <h1 className="text-white text-center m-2 text-[10px] sm:text-[15px] w-full line-clamp-2 font-bold">
                  {series?.seriesName}
                </h1>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
