import {BsTwitter, BsGithub} from "react-icons/bs"
import {AboutModal} from "@/components/AboutModal";
import {useState} from "react";

export function Header() {
    const [showAboutModal, setShowAboutModal] = useState(false)
    return (
        <>
            <div className="h-12 w-full
                        flex flex-row justify-center">

                <button className="flex flex-row items-center
                            absolute top-2.5 left-10
                            rounded-md bg-white py-1 px-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50
                            "
                        onClick={() => setShowAboutModal(true)}
                >
                    About
                </button>
                <div className="font-sans text-xl font-medium mt-2">
                    HN Hiring Trends
                </div>
                <div className="flex flex-row items-center
                            absolute top-3 right-10">
                    <a href={"https://www.twitter.com/sberens1"}>
                        <BsTwitter className="text-2xl mr-2"/>
                    </a>
                    <a href={"https://www.github.com/simonberens/hn-jobs"}>
                        <BsGithub className="text-2xl"/>
                    </a>
                </div>
            </div>
            <AboutModal open={showAboutModal} setOpen={setShowAboutModal}/>
        </>
    )
}