import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface BannerProps {
  text: string;
  linkToTarget: string;
}

const Banner: React.FC<BannerProps> = ({ text, linkToTarget }) => {
  const [displayBanner, setDisplayBanner] = useState(true);

  const onClose = () => {
    setDisplayBanner(false);
  };

  const buttonClass = `flex rounded-md p-2 hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white`;

  if (!displayBanner) {
    return null;
  }

  return (
    <div className="sticky top-0 bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-green-500/95 to-blue-400/90 backdrop-blur-md z-20">
      <div className="mx-auto max-w-7xl py-3 px-3 sm:px-6 lg:px-8">
        <div className="pr-16 sm:px-16 sm:text-center">
          <p className="font-medium text-white">
            <span className="md:inline">{text}</span>
            <span className="block sm:ml-2 sm:inline-block">
              <a
                href={linkToTarget}
                className="font-bold text-white underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more
                <span aria-hidden="true"> &rarr;</span>
              </a>
            </span>
          </p>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-start pt-1 pr-1 sm:items-start sm:pt-1 sm:pr-2">
          <button type="button" className={buttonClass} onClick={onClose}>
            <span className="sr-only">Dismiss</span>
            <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Banner;
